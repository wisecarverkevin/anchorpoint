/*
  AnchorPoint — Reset coach (Supabase Edge Function, Deno)

  Holds ANTHROPIC_API_KEY server-side. The browser must never see it: a Vite SPA
  ships its env to every visitor, and the Anthropic API rejects browser origins
  by default.

  Deploy:
    supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
    supabase functions deploy reset-coach

  Two modes:
    mode: "reflection"   -> the full 3-5 paragraph coach response ("Go deeper")
    mode: "interstitial" -> one brief warm line between steps (coach toggle on)
*/

// Pin the version: an older SDK predates the `fallbacks` parameter below.
import Anthropic from 'npm:@anthropic-ai/sdk@0.117.1';
import { createClient } from 'npm:@supabase/supabase-js@2';

const MODEL = 'claude-opus-5';

// Verbatim from the product spec. Do not paraphrase.
const COACH_SYSTEM_PROMPT =
  'You are the AnchorPoint coach — a warm, grounded counselor who responds only to what the user has written in their reset session. You do not initiate new topics. You do not diagnose. You do not give advice outside what the user has shared. If the user appears to be in crisis, respond with warmth and direct them to professional support. Your response should be 3 to 5 paragraphs. Speak directly to the person, not about them. Reference specific things they wrote. Look one level deeper than what they said on the surface. End with one question or one honest observation — never both.';

const INTERSTITIAL_SYSTEM_PROMPT =
  'You are the AnchorPoint coach — a warm, grounded counselor. The user is partway through a guided reset. Respond to what they just wrote with a single short sentence: acknowledge it and let it land. Do not ask a question, do not give advice, do not introduce a new topic, and do not preview the next step. One sentence, maximum 25 words, spoken directly to the person.';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

/*
  Builds the user message in the exact format the spec specifies. Unanswered
  steps become "(not answered)" so the shape stays stable and the coach is never
  handed a dangling label.
*/
function buildReflectionMessage(a: Record<string, string>): string {
  const v = (key: string) => {
    const raw = (a[key] ?? '').trim();
    return raw.length > 0 ? raw : '(not answered)';
  };

  return (
    'Here is what came up in my reset today: ' +
    `What brought me here: ${v('entry')}. ` +
    `Where I felt it in my body: ${v('body')}. ` +
    `What I was feeling: ${v('emotions')}. ` +
    `Underneath that: ${v('underneath')}. ` +
    `Cornerstone: ${v('cornerstone')}. ` +
    `What someone watching would see: ${v('outsideView')}. ` +
    `What tomorrow would feel like if this shifted: ${v('miracle')}. ` +
    `What I told my friend: ${v('friend')}. ` +
    `What landed when I read it back: ${v('mirror')}. ` +
    `What I know now: ${v('knowNow')}. ` +
    `My one step: ${v('oneStep')}. ` +
    `I came in feeling ${v('cameInFeeling')} and I am leaving with ${v('leavingWith')}.`
  );
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    return json({ error: 'ANTHROPIC_API_KEY is not configured for this function.' }, 500);
  }

  // Only signed-in users may spend tokens. The caller's JWT is forwarded by
  // supabase-js; verify it against the project rather than trusting the body.
  const authHeader = req.headers.get('Authorization') ?? '';
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return json({ error: 'Not authenticated.' }, 401);
  }

  let body: { mode?: string; answers?: Record<string, string>; justAnswered?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400);
  }

  const mode = body.mode === 'interstitial' ? 'interstitial' : 'reflection';
  const client = new Anthropic({ apiKey });

  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      // Interstitials are one sentence; the reflection is 3-5 paragraphs.
      max_tokens: mode === 'interstitial' ? 200 : 4000,
      // Sampling parameters (temperature/top_p/top_k) are rejected on this model.
      // Depth is controlled with effort instead. Thinking is on by default here,
      // which is deliberate: explicitly disabling it can leak internal tags into
      // the visible response.
      output_config: { effort: mode === 'interstitial' ? 'low' : 'medium' },
      // Safety classifiers can decline a request outright. Opting in lets the
      // API re-run it on a fallback model rather than returning nothing —
      // worth having on a tool where users write about distress.
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: mode === 'interstitial' ? INTERSTITIAL_SYSTEM_PROMPT : COACH_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content:
            mode === 'interstitial'
              ? `I just wrote this in my reset: ${(body.justAnswered ?? '').trim()}`
              : buildReflectionMessage(body.answers ?? {}),
        },
      ],
    });

    // stop_reason must be checked before reading content — on a refusal the
    // content array is empty or partial and indexing it blindly would throw.
    if (response.stop_reason === 'refusal') {
      return json({
        refused: true,
        text:
          "I'm not able to respond to this one. If you're going through something heavy right now, please reach out to someone who can help directly — a counselor, a doctor, or a crisis line in your area.",
      });
    }

    const text = response.content
      .filter((block): block is { type: 'text'; text: string } => block.type === 'text')
      .map((block) => block.text)
      .join('\n')
      .trim();

    return json({ text });
  } catch (error) {
    console.error('reset-coach failed:', error);
    // `detail` surfaces the upstream failure so a broken deploy is diagnosable
    // without log access. It is the API's own error text, never the API key.
    return json(
      {
        error: 'The coach is unavailable right now.',
        detail: error instanceof Error ? error.message : String(error),
      },
      502,
    );
  }
});
