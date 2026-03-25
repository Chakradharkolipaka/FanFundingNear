import { providers } from "near-api-js";
import { getConfig, CONTRACT_ID } from "@/constants";

/**
 * Create a JSON RPC provider for making view calls to NEAR
 */
export function getProvider(): providers.JsonRpcProvider {
  const config = getConfig();
  return new providers.JsonRpcProvider({ url: config.nodeUrl });
}

/**
 * Make a view function call to the contract (no gas/deposit required)
 */
export async function viewFunction<T = unknown>(
  methodName: string,
  args: Record<string, unknown> = {},
  contractId: string = CONTRACT_ID
): Promise<T> {
  const provider = getProvider();
  const argsBase64 = Buffer.from(JSON.stringify(args)).toString("base64");

  const result = await provider.query({
    request_type: "call_function",
    account_id: contractId,
    method_name: methodName,
    args_base64: argsBase64,
    finality: "final",
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bytes = (result as any).result;
  const parsed = JSON.parse(Buffer.from(bytes).toString());
  return parsed as T;
}
