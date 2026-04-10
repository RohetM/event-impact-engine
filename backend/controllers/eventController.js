const { runAgent } = require('../utils/geminiAgent');

exports.analyzeEvent = async (req, res) => {
  const { user_input: event } = req.body;

  if (!event || event.trim() === '') {
    return res.status(400).json({ error: 'Event description (user_input) is required.' });
  }

  console.log(`\n--- Starting API pipeline for event: "${event}" ---`);

  try {
    // ----------------------------------------------------------------------
    // Stage 1: Event Analyzer
    // ----------------------------------------------------------------------
    const analyzerPrompt = `You are an Event Analyzer intelligence agent.
    Categorize the geopolitical, economic, or natural event and extract core facts.
    If the input is nonsense, completely trivial, or not an event, respond EXACTLY with this JSON: { "error": "Invalid or trivial event. Please provide a clear global event." }
    Otherwise, respond with a JSON object describing the event parameters.

    EXAMPLE INPUT: "US imposes 20% tariffs on EV imports"
    EXAMPLE OUTPUT: { "category": "Economic/Geopolitical", "who": "US Government", "what": "20% tariffs on EVs", "where": "United States", "when": "Current", "why": "Trade policy" }

    Ensure your response is ONLY valid JSON.`;
    
    console.log('[Agent 1] Running Event Analyzer...');
    const event_analysis = await runAgent(analyzerPrompt, event, true);

    // Guardrail check
    if (event_analysis.error) {
      console.warn('[Agent 1] Guardrail triggered. Returning error.');
      return res.status(400).json({ error: event_analysis.error });
    }

    // ----------------------------------------------------------------------
    // Stage 2: Sector Mapper
    // ----------------------------------------------------------------------
    const sectorPrompt = `You are a Sector Mapper intelligence agent.
    Based on the Event Analysis, identify global industries, markets, and sectors impacted.
    Format your response as a JSON array of objects, where each object has a 'sector', 'rationale', and a strictly constrained 'sentiment' field (must be exactly 'Bullish', 'Bearish', or 'Neutral').

    EXAMPLE INPUT: {"category": "Economic/Geopolitical", "who": "US Government", "what": "20% tariffs on EVs"}
    EXAMPLE OUTPUT: [
      {"sector": "Automotive", "rationale": "Directly impacted by tariff costs", "sentiment": "Bearish"}, 
      {"sector": "Domestic EV Startups", "rationale": "Protected from cheap imports", "sentiment": "Bullish"},
      {"sector": "Overall Grid Infrastructure", "rationale": "Long term unchanged", "sentiment": "Neutral"}
    ]

    Ensure your response is ONLY valid JSON.`;
    
    console.log('[Agent 2] Running Sector Mapper...');
    const sector_mapping = await runAgent(sectorPrompt, JSON.stringify(event_analysis), true);

    // ----------------------------------------------------------------------
    // Stage 3: Impact Predictor
    // ----------------------------------------------------------------------
    const predictorPrompt = `You are an Impact Predictor intelligence agent.
    Predict short-term (1-3 months) and long-term (1-5 years) consequences based on the Sector Mapping and Event Analysis.
    Return a valid JSON object strictly adhering to this schema:
    {
      "short_term_predictions": [ "prediction 1" ],
      "long_term_predictions": [ "prediction 1" ],
      "macroeconomic_reasoning": "Detailed explanation of economic forces at play",
      "historical_parallels": [ "Similar event 1" ],
      "confidence_score": 85
    }

    Ensure your response is ONLY valid JSON.`;
    
    console.log('[Agent 3] Running Impact Predictor...');
    const contextForPredictor = JSON.stringify({ event_analysis, sector_mapping });
    const predictions = await runAgent(predictorPrompt, contextForPredictor, true);

    // ----------------------------------------------------------------------
    // Stage 4: Explainer (Executive Summary)
    // ----------------------------------------------------------------------
    const explainerPrompt = `You are an Executive Explainer intelligence agent.
    Synthesize the context into a final cohesive JSON executive summary for a dashboard. Keep language extremely simple, human-readable, and direct. Avoid jargon.
    You MUST return JSON with EXACTLY these keys:
    - "severityScore" (number from 1 to 10)
    - "overallSummary" (string, simple 2-sentence summary)
    - "economicImpact" (object with "status" string like 'Negative'/'Positive'/'Neutral', "details" string)
    - "societalImpact" (object with "status" string like 'Severe'/'Moderate'/'Low', "details" string)
    - "recommendedActions" (array of 3-5 simple, actionable recommendations)
    Ensure valid JSON formatting.`;
    
    console.log('[Agent 4] Running Explainer...');
    const contextForExplainer = JSON.stringify({ event_analysis, sector_mapping, predictions });
    const executive_summary = await runAgent(explainerPrompt, contextForExplainer, true);

    console.log('--- Pipeline complete ---');

    // ----------------------------------------------------------------------
    // Return Final Combined Output
    // ----------------------------------------------------------------------
    res.status(200).json({
      event_analysis,
      sector_mapping,
      predictions,
      executive_summary
    });

  } catch (error) {
    console.error("Error in AI Pipeline:", error.message);
    res.status(500).json({ error: "Internal server error during analysis. Ensure Gemini API key is configured properly." });
  }
};
