//@ts-check
// extension.js
import { LlmQueryComponent } from "./component_LlmQuery.js";

import { async_getLlmManagerComponent_Openai } from "./component_LlmManager_Openai.js";
import { LlmQueryComponent_Openai } from "./component_LlmQuery_Openai.js";

// TBD: Move async_getLlmManagerOobaboogaComponen and LlmManagerLmStudioComponent into their own extension


async function CreateComponents() 
{
  const LlmManagerOpenaiComponent = await async_getLlmManagerComponent_Openai();
  const components = [
    LlmQueryComponent, 
    LlmManagerOpenaiComponent, 
    LlmQueryComponent_Openai,
    ];

  return {
    blocks: components,
    patches: []
  }
}

export default {createComponents: CreateComponents}