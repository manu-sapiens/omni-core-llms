
await(async()=>{let{dirname:e}=await import("path"),{fileURLToPath:i}=await import("url");if(typeof globalThis.__filename>"u"&&(globalThis.__filename=i(import.meta.url)),typeof globalThis.__dirname>"u"&&(globalThis.__dirname=e(globalThis.__filename)),typeof globalThis.require>"u"){let{default:a}=await import("module");globalThis.require=a.createRequire(import.meta.url)}})();


// component_LlmQuery.js
import { createComponent } from "omni-utils";
import { queryLlmByModelId, DEFAULT_LLM_MODEL_ID } from "omni-utils";
import { getLlmQueryInputs, LLM_QUERY_OUTPUT, LLM_QUERY_CONTROL } from "omni-utils";
var GROUP_ID = "text_generation";
async function async_getLlmQueryComponent_Universal() {
  const links2 = {};
  const input = await getLlmQueryInputs(true);
  const output = LLM_QUERY_OUTPUT;
  const control = LLM_QUERY_CONTROL;
  const LlmQueryComponent = createComponent(GROUP_ID, "llm_query_universal", "LLM Query (Universal)", "Text Generation", "Query a LLM using its id", "Query the specified LLM from various providers", links2, input, output, control, runUniversalPayload);
  return LlmQueryComponent;
}
async function runUniversalPayload(payload, ctx) {
  const failure = { result: { "ok": false }, answer_text: "", answer_json: null };
  if (!payload)
    return failure;
  const instruction = payload.instruction;
  const prompt = payload.prompt;
  const temperature = payload.temperature;
  const model_id = payload.model_id;
  const args = payload.args;
  const response = await queryLlmByModelId(ctx, prompt, instruction, model_id, temperature, args);
  return response;
}

// component_LlmManager_Openai.js
import { createComponent as createComponent2 } from "omni-utils";
import { getLlmChoices } from "omni-utils";
var MODEL_PROVIDER = "openai";
var PROVIDER_NAME = "OpenAI";
async function async_getLlmManagerComponent_Openai() {
  const llm_choices = await getLlmChoices();
  const inputs = [
    { name: "model_id", title: "model", type: "string", defaultValue: "gpt-3.5-turbo-16k|openai", choices: llm_choices, customSocket: "text" },
    { name: "functions", title: "functions", type: "array", customSocket: "objectArray", description: "Optional functions to constrain the LLM output" },
    { name: "args", type: "object", customSocket: "object", description: "Extra arguments provided to the LLM" }
  ];
  const outputs = [
    { name: "model_id", type: "string", customSocket: "text", description: "The ID of the selected LLM model" },
    { name: "args", title: "Model Args", type: "object", customSocket: "object", description: "Extra arguments provided to the LLM" }
  ];
  const controls = null;
  const links2 = {};
  const LlmManagerComponent = createComponent2(MODEL_PROVIDER, "llm_manager", `LLM Manager: ${PROVIDER_NAME}`, "Text Generation", `Manage LLMs from provider: ${PROVIDER_NAME}`, `Manage LLMs from provider: ${PROVIDER_NAME}`, links2, inputs, outputs, controls, parsePayload);
  return LlmManagerComponent;
}
async function parsePayload(payload, ctx) {
  const failure = { result: { "ok": false }, model_id: null };
  const args = payload.args;
  const functions = payload.functions;
  const model_id = payload.model_id;
  const block_args = { ...args };
  if (functions)
    block_args["functions"] = functions;
  if (!payload)
    return failure;
  const return_value = { result: { "ok": true }, model_id, args: block_args };
  return return_value;
}

// component_LlmQuery_Openai.js
import { async_getLlmQueryComponent, extractLlmQueryPayload } from "omni-utils";
import { Llm_Openai } from "omni-utils";
var MODEL_PROVIDER2 = "openai";
var llm = new Llm_Openai();
var links = {};
async function async_getLlmQueryComponent_Openai() {
  const result = await async_getLlmQueryComponent(MODEL_PROVIDER2, links, runProviderPayload, true);
  return result;
}
async function runProviderPayload(payload, ctx) {
  const { instruction, prompt, temperature, model_name, args } = extractLlmQueryPayload(payload, MODEL_PROVIDER2);
  const response = await llm.query(ctx, prompt, instruction, model_name, temperature, args);
  return response;
}

// extension.js
async function CreateComponents() {
  const LlmManagerOpenaiComponent = await async_getLlmManagerComponent_Openai();
  const LlmQueryComponent_Openai = await async_getLlmQueryComponent_Openai();
  const LlmQueryComponent_Universal = await async_getLlmQueryComponent_Universal();
  const components = [
    LlmQueryComponent_Universal,
    LlmManagerOpenaiComponent,
    LlmQueryComponent_Openai
  ];
  return {
    blocks: components,
    patches: []
  };
}
var extension_default = { createComponents: CreateComponents };
export {
  extension_default as default
};
