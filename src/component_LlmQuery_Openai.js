//@ts-check
import { createLlmQueryComponent, extractPayload } from 'omnilib-llms/llmComponent.js';
import { Llm_Openai } from 'omnilib-llms/llm_Openai.js'
const MODEL_PROVIDER = 'openai';

const llm = new Llm_Openai();
const links = {}; // TBD: provide proper links
export const LlmQueryComponent_Openai =  createLlmQueryComponent(MODEL_PROVIDER, links, runProviderPayload );

async function runProviderPayload(payload, ctx) 
{
    const { instruction, prompt, temperature, model_name, args } = extractPayload(payload, MODEL_PROVIDER);
    const response = await llm.query(ctx, prompt, instruction, model_name, temperature, args);
    return response;
}
