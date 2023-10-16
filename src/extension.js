/**
 * Copyright (c) 2023 MERCENARIES.AI PTE. LTD.
 * All rights reserved.
 */

//@ts-check
import { async_getLlmQueryComponent_Universal } from "./component_LlmQuery.js";
import { async_getLlmManagerComponent_Openai } from "./component_LlmManager_Openai.js";
import { async_getLlmQueryComponent_Openai } from "./component_LlmQuery_Openai.js";

async function CreateComponents() 
{
  const LlmManagerOpenaiComponent = await async_getLlmManagerComponent_Openai();
  const LlmQueryComponent_Openai = await async_getLlmQueryComponent_Openai();
  const LlmQueryComponent_Universal = await async_getLlmQueryComponent_Universal();

  const components = [
    LlmQueryComponent_Universal, 
    LlmManagerOpenaiComponent, 
    LlmQueryComponent_Openai,
    ];

  return {
    blocks: components,
    patches: []
  }
}

export default {createComponents: CreateComponents}