/**
 * Copyright (c) 2023 MERCENARIES.AI PTE. LTD.
 * All rights reserved.
 */

//@ts-check
// component_LlmQuery.ts
import { createComponent } from 'omni-utils'; //'omnilib-utils/component.js';
import { queryLlmByModelId, DEFAULT_LLM_MODEL_ID } from 'omni-utils'; //'omnilib-llms/llms.js';
import { getLlmQueryInputs, LLM_QUERY_OUTPUT, LLM_QUERY_CONTROL } from 'omni-utils'; //'omnilib-llms/llmComponent.js';
const GROUP_ID = 'text_generation';

export async function async_getLlmQueryComponent_Universal()
{
    const links = {};
    const input = await getLlmQueryInputs(true);
    const output = LLM_QUERY_OUTPUT;
    const control = LLM_QUERY_CONTROL;
    
    const LlmQueryComponent = createComponent(GROUP_ID, 'llm_query_universal','LLM Query (Universal)', 'Text Generation','Query a LLM using its id', 'Query the specified LLM from various providers', links, input, output, control, runUniversalPayload );
    
    return LlmQueryComponent;
}



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

