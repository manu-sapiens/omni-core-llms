//@ts-check
import { async_getLlmQueryComponent, extractLlmQueryPayload } from 'omnilib-llms/llmComponent.js';
import { Llm_Openai } from 'omnilib-llms/llm_Openai.js'
const MODEL_PROVIDER = 'openai';

const llm = new Llm_Openai();
const links = {}; // TBD: provide proper links

export async function async_getLlmQueryComponent_Openai()
{
    const result = await async_getLlmQueryComponent(MODEL_PROVIDER, links, runProviderPayload, true );
    return result;
}

async function runProviderPayload(payload, ctx) 
{
    const { instruction, prompt, temperature, model_name, args } = extractLlmQueryPayload(payload, MODEL_PROVIDER);
    const response = await llm.query(ctx, prompt, instruction, model_name, temperature, args);
    return response;
}
