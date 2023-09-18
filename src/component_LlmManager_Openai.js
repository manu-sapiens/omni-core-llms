//@ts-check
import { createComponent } from 'omnilib-utils/component.js';
import { getLlmChoices } from 'omnilib-llms/llms.js';

const MODEL_PROVIDER = 'openai';
const PROVIDER_NAME = "OpenAI"

export async function async_getLlmManagerComponent_Openai()
{
    const llm_choices = await getLlmChoices();

    const inputs = [
        { name: 'model_id', title: 'model', type: 'string', defaultValue: 'gpt-3.5-turbo-16k|openai', choices: llm_choices , customSocket: 'text'},
        { name: 'functions', title: 'functions', type: 'array', customSocket: 'objectArray', description: 'Optional functions to constrain the LLM output' },
        { name: 'args', type: 'object', customSocket: 'object', description: 'Extra arguments provided to the LLM'},
    ];
    const outputs = [
        { name: 'model_id', type: 'string', customSocket: 'text', description: "The ID of the selected LLM model"},
        { name: 'args', title: "Model Args", type: 'object', customSocket: 'object', description: 'Extra arguments provided to the LLM'},
    ]
    const controls = null; //[{ name: "functions", title: "LLM Functions", placeholder: "AlpineCodeMirrorComponent", description: "Functions to constrain the output of the LLM" },];

    const links = {}

    const LlmManagerComponent = createComponent(MODEL_PROVIDER, 'llm_manager',`LLM Manager: ${PROVIDER_NAME}`, 'Text Generation',`Manage LLMs from provider: ${PROVIDER_NAME}`, `Manage LLMs from provider: ${PROVIDER_NAME}`, links, inputs, outputs, controls, parsePayload );

    return LlmManagerComponent;
}


async function parsePayload(payload, ctx) 
{
    const failure = { result: { "ok": false }, model_id: null};

    const args = payload.args;
    const functions = payload.functions;
    const model_id = payload.model_id;

    const block_args = {...args}
    if (functions) block_args['functions'] = functions;
    if (!payload) return failure;
    

    const return_value = { result: { "ok": true }, model_id: model_id, args: block_args};
    return return_value;
}