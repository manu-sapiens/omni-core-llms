
await(async()=>{let{dirname:e}=await import("path"),{fileURLToPath:i}=await import("url");if(typeof globalThis.__filename>"u"&&(globalThis.__filename=i(import.meta.url)),typeof globalThis.__dirname>"u"&&(globalThis.__dirname=e(globalThis.__filename)),typeof globalThis.require>"u"){let{default:a}=await import("module");globalThis.require=a.createRequire(import.meta.url)}})();


// node_modules/omnilib-utils/component.js
import { OAIBaseComponent, WorkerContext, OmniComponentMacroTypes } from "mercs_rete";
function generateTitle(name) {
  const title = name.replace(/_/g, " ").replace(/\b\w/g, (match) => match.toUpperCase());
  return title;
}
function setComponentInputs(component, inputs) {
  inputs.forEach(function(input) {
    var name = input.name, type = input.type, customSocket = input.customSocket, description = input.description, default_value = input.defaultValue, title = input.title, choices = input.choices, minimum = input.minimum, maximum = input.maximum, step = input.step;
    if (!title || title == "")
      title = generateTitle(name);
    component.addInput(
      component.createInput(name, type, customSocket).set("title", title || "").set("description", description || "").set("choices", choices || null).set("minimum", minimum || null).set("maximum", maximum || null).set("step", step || null).setDefault(default_value).toOmniIO()
    );
  });
  return component;
}
function setComponentOutputs(component, outputs) {
  outputs.forEach(function(output) {
    var name = output.name, type = output.type, customSocket = output.customSocket, description = output.description, title = output.title;
    if (!title || title == "")
      title = generateTitle(name);
    component.addOutput(
      component.createOutput(name, type, customSocket).set("title", title || "").set("description", description || "").toOmniIO()
    );
  });
  return component;
}
function setComponentControls(component, controls) {
  controls.forEach(function(control) {
    var name = control.name, title = control.title, placeholder = control.placeholder, description = control.description;
    if (!title || title == "")
      title = generateTitle(name);
    component.addControl(
      component.createControl(name).set("title", title || "").set("placeholder", placeholder || "").set("description", description || "").toOmniControl()
    );
  });
  return component;
}
function createComponent(group_id, id, title, category, description, summary, links3, inputs, outputs, controls, payloadParser) {
  if (!links3)
    links3 = {};
  let baseComponent = OAIBaseComponent.create(group_id, id).fromScratch().set("title", title).set("category", category).set("description", description).setMethod("X-CUSTOM").setMeta({
    source: {
      summary,
      links: links3
    }
  });
  baseComponent = setComponentInputs(baseComponent, inputs);
  baseComponent = setComponentOutputs(baseComponent, outputs);
  if (controls)
    baseComponent = setComponentControls(baseComponent, controls);
  baseComponent.setMacro(OmniComponentMacroTypes.EXEC, payloadParser);
  const component = baseComponent.toJSON();
  return component;
}

// node_modules/omnilib-llms/llm.js
import { omnilog as omnilog2 } from "mercs_shared";

// node_modules/omnilib-utils/files.js
import { ClientExtension, ClientUtils } from "mercs_client";

// node_modules/omnilib-utils/utils.js
import { omnilog } from "mercs_shared";
var VERBOSE = true;
function is_valid(value) {
  if (value === null || value === void 0) {
    return false;
  }
  if (Array.isArray(value) && value.length === 0) {
    return false;
  }
  if (typeof value === "object" && Object.keys(value).length === 0) {
    return false;
  }
  if (typeof value === "string" && value.trim() === "") {
    return false;
  }
  return true;
}
function clean_string(original) {
  if (is_valid(original) == false) {
    return "";
  }
  let text = sanitizeString(original);
  text = text.replace(/\n+/g, " ");
  text = text.replace(/ +/g, " ");
  return text;
}
function sanitizeString(original, use_escape_character = false) {
  return use_escape_character ? original.replace(/'/g, "\\'").replace(/"/g, '\\"') : original.replace(/'/g, "\u2018").replace(/"/g, "\u201C");
}
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function pauseForSeconds(seconds) {
  console_log("Before pause");
  await delay(seconds * 1e3);
  console_log("After pause");
}
function console_log(...args) {
  if (VERBOSE == true) {
    omnilog.log(...args);
  }
}

// node_modules/omnilib-llms/llm.js
function generateModelId(model_name, model_provider) {
  return `${model_name}|${model_provider}`;
}
function getModelNameAndProviderFromId(model_id) {
  if (!model_id)
    throw new Error(`getModelNameAndProviderFromId: model_id is not valid: ${model_id}`);
  const splits = model_id.split("|");
  if (splits.length != 2)
    throw new Error(`splitModelNameFromType: model_id is not valid: ${model_id}`);
  return { model_name: splits[0], model_provider: splits[1] };
}
function deduceLlmTitle(model_name, model_provider, provider_icon = "?") {
  const title = provider_icon + model_name.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) + " (" + model_provider + ")";
  return title;
}
function deduceLlmDescription(model_name, context_size = 0) {
  let description = model_name.substring(0, model_name.length - 4);
  if (context_size > 0)
    description += ` (${Math.floor(context_size / 1024)}k)`;
  return description;
}
async function fixJsonWithLlm(llm2, json_string_to_fix) {
  const ctx = llm2.ctx;
  let response = null;
  const args = {};
  args.user = ctx.userId;
  args.prompt = json_string_to_fix;
  args.instruction = "Fix the JSON string below. Do not output anything else but the carefully fixed JSON string.";
  ;
  args.temperature = 0;
  try {
    response = await llm2.runLlmBlock(ctx, args);
  } catch (err) {
    console.error(`[FIXING] fixJsonWithLlm: Error fixing json: ${err}`);
    return null;
  }
  let text = response?.answer_text || "";
  console_log(`[FIXING] fixJsonWithLlm: text: ${text}`);
  if (is_valid(text) === false)
    return null;
  return text;
}
async function fixJsonString(llm2, passed_string) {
  if (is_valid(passed_string) === false) {
    throw new Error(`[FIXING] fixJsonString: passed string is not valid: ${passed_string}`);
  }
  if (typeof passed_string !== "string") {
    throw new Error(`[FIXING] fixJsonString: passed string is not a string: ${passed_string}, type = ${typeof passed_string}`);
  }
  let cleanedString = passed_string.replace(/\\n/g, "\n");
  let jsonObject = null;
  let fixed = false;
  let attempt_count = 0;
  let attempt_at_cleaned_string = cleanedString;
  while (fixed === false && attempt_count < 10) {
    attempt_count++;
    console_log(`[FIXING] Attempting to fix JSON string after ${attempt_count} attempts.
`);
    try {
      jsonObject = JSON.parse(attempt_at_cleaned_string);
    } catch (err) {
      console.error(`[FIXING] [${attempt_count}] Error fixing JSON string: ${err}, attempt_at_cleaned_string: ${attempt_at_cleaned_string}`);
    }
    if (jsonObject !== null && jsonObject !== void 0) {
      fixed = true;
      console_log(`[FIXING] Successfully fixed JSON string after ${attempt_count} attempts.
`);
      return jsonObject;
    }
    let response = await fixJsonWithLlm(llm2, passed_string);
    if (response !== null && response !== void 0) {
      attempt_at_cleaned_string = response;
    }
    await pauseForSeconds(0.5);
  }
  if (fixed === false) {
    throw new Error(`Error fixing JSON string after ${attempt_count} attempts.
cleanedString: ${cleanedString})`);
  }
  return "{}";
}
var Llm = class {
  constructor(tokenizer, params = null) {
    this.tokenizer = tokenizer;
    this.context_sizes = {};
  }
  countTextTokens(text) {
    return this.tokenizer.countTextTokens(text);
  }
  getModelContextSizeFromModelInfo(model_name) {
    return this.context_sizes[model_name];
  }
  // -----------------------------------------------------------------------
  /**
   * @param {any} ctx
   * @param {string} prompt
   * @param {string} instruction
   * @param {string} model_name
   * @param {number} [temperature=0]
   * @param {any} args
   * @returns {Promise<{ answer_text: string; answer_json: any; }>}
   */
  async query(ctx, prompt, instruction, model_name, temperature = 0, args = null) {
    throw new Error("You have to implement this method");
  }
  /**
  * @param {any} ctx
  * @param {any} args
  * @returns {Promise<{ answer_text: string; answer_json: any; }>}
  */
  async runLlmBlock(ctx, args) {
    throw new Error("You have to implement this method");
  }
  getProvider() {
    throw new Error("You have to implement this method");
  }
  getModelType() {
    throw new Error("You have to implement this method");
  }
  async getModelChoices(choices, llm_model_types, llm_context_sizes) {
    throw new Error("You have to implement this method");
  }
};

// node_modules/omnilib-utils/blocks.js
async function runBlock(ctx, block_name, args, outputs = {}) {
  try {
    const app = ctx.app;
    if (!app) {
      throw new Error(`[runBlock] app not found in ctx`);
    }
    const blocks = app.blocks;
    if (!blocks) {
      throw new Error(`[runBlock] blocks not found in app`);
    }
    const result = await blocks.runBlock(ctx, block_name, args, outputs);
    return result;
  } catch (err) {
    throw new Error(`Error running block ${block_name}: ${err}`);
  }
}

// node_modules/omnilib-llms/tokenizer_Openai.js
import { encode, isWithinTokenLimit } from "gpt-tokenizer";

// node_modules/omnilib-llms/tokenizer.js
var Tokenizer = class {
  constructor(params = null) {
  }
  encodeText(text) {
    throw new Error("You have to implement the method: encode");
  }
  textIsWithinTokenLimit(text, token_limit) {
    throw new Error("You have to implement the method: isWithinTokenLimit");
  }
  countTextTokens(text) {
    throw new Error("You have to implement the method: countTextTokens");
  }
};

// node_modules/omnilib-llms/tokenizer_Openai.js
var Tokenizer_Openai = class extends Tokenizer {
  constructor() {
    super();
  }
  encodeText(text) {
    return encode(text);
  }
  countTextTokens(text) {
    const tokens = encode(text);
    if (tokens !== null && tokens !== void 0 && tokens.length > 0) {
      const num_tokens = tokens.length;
      return num_tokens;
    } else {
      return 0;
    }
  }
  textIsWithinTokenLimit(text, token_limit) {
    return isWithinTokenLimit(text, token_limit);
  }
};

// node_modules/omnilib-llms/llm_Openai.js
var LLM_PROVIDER_OPENAI_SERVER = "openai";
var LLM_MODEL_TYPE_OPENAI = "openai";
var BLOCK_OPENAI_ADVANCED_CHATGPT = "openai.advancedChatGPT";
var LLM_CONTEXT_SIZE_MARGIN = 500;
var GPT3_MODEL_SMALL = "gpt-3.5-turbo";
var GPT3_MODEL_LARGE = "gpt-3.5-turbo-16k";
var GPT3_SIZE_CUTOFF = 4096 - LLM_CONTEXT_SIZE_MARGIN;
var GPT4_MODEL_SMALL = "gpt-4";
var GPT4_MODEL_LARGE = "gpt-4-32k";
var GPT4_SIZE_CUTOFF = 8192 - LLM_CONTEXT_SIZE_MARGIN;
var ICON_OPENAI = "\u{1F4B0}";
var llm_openai_models = [
  { model_name: GPT3_MODEL_SMALL, model_type: LLM_MODEL_TYPE_OPENAI, context_size: 4096, provider: LLM_PROVIDER_OPENAI_SERVER },
  { model_name: GPT3_MODEL_LARGE, model_type: LLM_MODEL_TYPE_OPENAI, context_size: 16384, provider: LLM_PROVIDER_OPENAI_SERVER },
  { model_name: GPT4_MODEL_SMALL, model_type: LLM_MODEL_TYPE_OPENAI, context_size: 8192, provider: LLM_PROVIDER_OPENAI_SERVER },
  { model_name: GPT4_MODEL_LARGE, model_type: LLM_MODEL_TYPE_OPENAI, context_size: 32768, provider: LLM_PROVIDER_OPENAI_SERVER }
];
var Llm_Openai = class extends Llm {
  constructor() {
    const tokenizer_Openai = new Tokenizer_Openai();
    super(tokenizer_Openai);
    this.context_sizes[GPT3_MODEL_SMALL] = 4096;
    this.context_sizes[GPT3_MODEL_LARGE] = 16384;
    this.context_sizes[GPT4_MODEL_SMALL] = 8192;
    this.context_sizes[GPT4_MODEL_LARGE] = 16384;
  }
  // -----------------------------------------------------------------------
  /**
   * @param {any} ctx
   * @param {string} prompt
   * @param {string} instruction
   * @param {string} model_name
   * @param {number} [temperature=0]
   * @param {any} [args=null]
   * @returns {Promise<{ answer_text: string; answer_json: any; }>}
   */
  async query(ctx, prompt, instruction, model_name, temperature = 0, args = null) {
    let block_args = { ...args };
    block_args.user = ctx.userId;
    if (prompt != "")
      block_args.prompt = prompt;
    if (instruction != "")
      block_args.instruction = instruction;
    block_args.temperature = temperature;
    block_args.model = model_name;
    const response = await this.runLlmBlock(ctx, block_args);
    if (response.error)
      throw new Error(response.error);
    const total_tokens = response?.usage?.total_tokens || 0;
    let answer_text = response?.answer_text || "";
    const function_arguments_string = response?.function_arguments_string || "";
    let function_arguments = null;
    if (is_valid(function_arguments_string) == true)
      function_arguments = await fixJsonString(ctx, function_arguments_string);
    if (is_valid(answer_text) == true)
      answer_text = clean_string(answer_text);
    let answer_json = {};
    answer_json["function_arguments_string"] = function_arguments_string;
    answer_json["function_arguments"] = function_arguments;
    answer_json["total_tokens"] = total_tokens;
    answer_json["answer_text"] = answer_text;
    const return_value = {
      answer_text,
      answer_json
    };
    return return_value;
  }
  getProvider() {
    return LLM_PROVIDER_OPENAI_SERVER;
  }
  getModelType() {
    return LLM_MODEL_TYPE_OPENAI;
  }
  async getModelChoices(choices, llm_model_types, llm_context_sizes) {
    const models = Object.values(llm_openai_models);
    for (const model of models) {
      let model_name = model.model_name;
      let provider = model.provider;
      let model_id = generateModelId(model_name, provider);
      const title = model.title || deduceLlmTitle(model_name, provider, ICON_OPENAI);
      const description = model.description || deduceLlmDescription(model_name, model.context_size);
      llm_model_types[model_name] = model.type;
      llm_context_sizes[model_name] = model.context_size;
      const choice = { value: model_id, title, description };
      choices.push(choice);
    }
  }
  async runLlmBlock(ctx, args) {
    const prompt = args.prompt;
    const instruction = args.instruction;
    const model = args.model;
    const prompt_cost = this.tokenizer.countTextTokens(prompt);
    const instruction_cost = this.tokenizer.countTextTokens(instruction);
    const cost = prompt_cost + instruction_cost;
    args.model = this.adjustModel(cost, model);
    let response = null;
    try {
      response = await runBlock(ctx, BLOCK_OPENAI_ADVANCED_CHATGPT, args);
    } catch (err) {
      let error_message = `Error running openai.advancedChatGPT: ${err.message}`;
      console.error(error_message);
      throw err;
    }
    return response;
  }
  adjustModel(text_size, model_name) {
    if (typeof text_size !== "number") {
      throw new Error(`adjust_model: text_size is not a string or a number: ${text_size}, type=${typeof text_size}`);
    }
    if (model_name == GPT3_MODEL_SMALL)
      return model_name;
    if (model_name == GPT3_MODEL_LARGE) {
      if (text_size < GPT3_SIZE_CUTOFF)
        return GPT3_MODEL_SMALL;
      else
        return model_name;
    }
    if (model_name == GPT4_MODEL_SMALL)
      return model_name;
    if (model_name == GPT4_MODEL_LARGE) {
      if (text_size < GPT4_SIZE_CUTOFF)
        return GPT3_MODEL_SMALL;
      else
        return model_name;
    }
    throw new Error(`pick_model: Unknown model: ${model_name}`);
  }
};

// node_modules/omnilib-llms/llms.js
var DEFAULT_LLM_MODEL_ID = "gpt-3.5-turbo|openai";
var default_providers = [];
var llm_Openai = new Llm_Openai();
default_providers.push(llm_Openai);
function getBlockName(model_id) {
  const splits = getModelNameAndProviderFromId(model_id);
  const model_name = splits.model_name;
  const model_provider = splits.model_provider;
  let block_name = `omni-extension-${model_provider}:${model_provider}.llm_query`;
  if (model_provider == "openai") {
    block_name = `omni-core-llms:${model_provider}.llm_query`;
  }
  return block_name;
}
async function queryLlmByModelId(ctx, prompt, instruction, model_id, temperature = 0, args = null) {
  const block_name = getBlockName(model_id);
  const block_args = { prompt, instruction, model_id, temperature, args };
  const response = await runBlock(ctx, block_name, block_args);
  return response;
}

// node_modules/omnilib-llms/llmComponent.js
function get_llm_query_inputs(default_llm = "") {
  const input = [
    { name: "instruction", type: "string", description: "Instruction(s)", defaultValue: "You are a helpful bot answering the user with their question to the best of your abilities", customSocket: "text" },
    { name: "prompt", type: "string", customSocket: "text", description: "Prompt(s)" },
    { name: "temperature", type: "number", defaultValue: 0.7, minimum: 0, maximum: 2, description: "The randomness regulator, higher for more creativity, lower for more structured, predictable text." }
  ];
  if (default_llm != "") {
    input.push({ name: "model_id", type: "string", customSocket: "text", defaultValue: default_llm, description: "The provider of the LLM model to use" });
  } else {
    input.push({ name: "model_id", type: "string", customSocket: "text", description: "The provider of the LLM model to use" });
  }
  input.push({ name: "args", type: "object", customSocket: "object", description: "Extra arguments provided to the LLM" });
  return input;
}
var LLM_QUERY_OUTPUT = [
  { name: "answer_text", type: "string", customSocket: "text", description: "The answer to the query", title: "Answer" },
  { name: "answer_json", type: "object", customSocket: "object", description: "The answer in json format, with possibly extra arguments returned by the LLM", title: "Json" }
];
var LLM_QUERY_CONTROL = null;
function createLlmQueryComponent(model_provider, links3, payloadParser) {
  const group_id = model_provider;
  const id = `llm_query`;
  const title = `LLM Query via ${model_provider}`;
  const category = "LLM";
  const description = `Query a LLM with ${model_provider}`;
  const summary = `Query the specified LLM via ${model_provider}`;
  const inputs = get_llm_query_inputs();
  const outputs = LLM_QUERY_OUTPUT;
  const controls = LLM_QUERY_CONTROL;
  const component = createComponent(group_id, id, title, category, description, summary, links3, inputs, outputs, controls, payloadParser);
  return component;
}
function extractPayload(payload, model_provider) {
  if (!payload)
    throw new Error("No payload provided.");
  const instruction = payload.instruction;
  const prompt = payload.prompt;
  const temperature = payload.temperature || 0;
  const model_id = payload.model_id;
  const args = payload.args;
  if (!prompt)
    throw new Error(`ERROR: no prompt provided!`);
  const splits = getModelNameAndProviderFromId(model_id);
  const passed_model_name = splits.model_name;
  const passed_provider = splits.model_provider;
  if (passed_provider != model_provider)
    throw new Error(`ERROR: model_provider (${passed_provider}) != ${model_provider}`);
  return {
    instruction,
    prompt,
    temperature,
    model_name: passed_model_name,
    args
  };
}

// component_LlmQuery.js
var NS_ONMI = "text_generation";
var links = {};
var LlmQueryComponent = createComponent(NS_ONMI, "llm_query_universal", "LLM Query (Universal)", "Text Generation", "Query a LLM using its id", "Query the specified LLM from various providers", links, get_llm_query_inputs(DEFAULT_LLM_MODEL_ID), LLM_QUERY_OUTPUT, LLM_QUERY_CONTROL, runUniversalPayload);
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
var MODEL_PROVIDER = "openai";
var PROVIDER_NAME = "OpenAI";
async function async_getLlmManagerComponent_Openai() {
  const llm2 = new Llm_Openai();
  const choices = [];
  const llm_model_types = {};
  const llm_context_sizes = {};
  await llm2.getModelChoices(choices, llm_model_types, llm_context_sizes);
  const inputs = [
    { name: "model_id", type: "string", customSocket: "text", defaultValue: DEFAULT_LLM_MODEL_ID, choices },
    { name: "functions", title: "functions", type: "array", customSocket: "objectArray", description: "Optional functions to constrain the LLM output" },
    { name: "args", type: "object", customSocket: "object", description: "Extra arguments provided to the LLM" }
  ];
  const outputs = [
    { name: "model_id", type: "string", customSocket: "text", description: "The ID of the selected LLM model" },
    { name: "args", type: "object", customSocket: "object", description: "Extra arguments provided to the LLM" }
  ];
  const controls = null;
  const links3 = {};
  const LlmManagerComponent = createComponent(MODEL_PROVIDER, "llm_manager", `LLM Manager: ${PROVIDER_NAME}`, "Text Generation", `Manage LLMs from provider: ${PROVIDER_NAME}`, `Manage LLMs from provider: ${PROVIDER_NAME}`, links3, inputs, outputs, controls, parsePayload);
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
var MODEL_PROVIDER2 = "openai";
var llm = new Llm_Openai();
var links2 = {};
var LlmQueryComponent_Openai = createLlmQueryComponent(MODEL_PROVIDER2, links2, runProviderPayload);
async function runProviderPayload(payload, ctx) {
  const { instruction, prompt, temperature, model_name, args } = extractPayload(payload, MODEL_PROVIDER2);
  const response = await llm.query(ctx, prompt, instruction, model_name, temperature, args);
  return response;
}

// extension.js
async function CreateComponents() {
  const LlmManagerOpenaiComponent = await async_getLlmManagerComponent_Openai();
  const components = [
    LlmQueryComponent,
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
