//@ts-check
// component_LlmQuery.ts
import { createComponent } from 'omnilib-utils/component.js';
import { queryLlmByModelId, DEFAULT_LLM_MODEL_ID } from 'omnilib-llms/llms.js';
import { get_llm_query_inputs, LLM_QUERY_OUTPUT, LLM_QUERY_CONTROL } from 'omnilib-llms/llmComponent.js';
const NS_ONMI = 'text_generation';

const links = {};

const LlmQueryComponent = createComponent(NS_ONMI, 'llm_query','LLM Query', 'Text Generation','Query a LLM', 'Query the specified LLM', links, get_llm_query_inputs(DEFAULT_LLM_MODEL_ID), LLM_QUERY_OUTPUT, LLM_QUERY_CONTROL, runUniversalPayload );

async function runUniversalPayload(payload, ctx) 
{
    const failure = { result: { "ok": false }, answer_text: "", answer_json: null};

    if (!payload) return failure;
    
    const instruction = payload.instruction;
    const prompt = payload.prompt;
    const temperature = payload.temperature;
    const model_id = payload.model_id;
    const args = payload.args;

    const response = await queryLlmByModelId(ctx, prompt, instruction, model_id, temperature, args);
    return response;
}

export { LlmQueryComponent };
