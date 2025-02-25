import { beforeEach, describe, expect, mock, test } from "bun:test";
import { type Chain, type Transport } from "viem";
import {
  type CreateIntentClientConfig,
  createIntentClient,
} from "../client/intentClient.js";
import { ZERODEV_URLS } from "../config/constants.js";

describe("createIntentClient", () => {
  let mockTransport: ReturnType<typeof mock>;
  let mockBundlerTransport: ReturnType<typeof mock>;
  let mockIntentTransport: ReturnType<typeof mock>;
  let mockRelayerTransport: ReturnType<typeof mock>;
  let mockCustom: ReturnType<typeof mock>;
  let mockCreateClient: ReturnType<typeof mock>;
  let mockExtend: ReturnType<typeof mock>;
  let mockHttp: ReturnType<typeof mock>;

  beforeEach(() => {
    // Reset mocks
    mockTransport = mock(() => ({
      request: mock(async () => ({})),
    }));

    mockBundlerTransport = mock(() => ({
      request: mock(async ({ method, params }) => {
        return { bundler: true, method, params };
      }),
    }));

    mockIntentTransport = mock(() => ({
      request: mock(async ({ method, params }) => {
        return { intent: true, method, params };
      }),
    }));

    mockRelayerTransport = mock(() => ({
      request: mock(async ({ method, params }) => {
        return { relayer: true, method, params };
      }),
    }));

    // mock viem
    mockCustom = mock(() => ({
      request: mock(() => mockTransport),
    }));
    mockExtend = mock((client) => {
      return {
        ...client,
        extend: mockExtend,
        newMethod: () => "extendedResult",
      };
    });
    mockCreateClient = mock(() => ({
      extend: mockExtend,
    }));
    mockHttp = mock(() => ({
      request: mock(() => ({})),
    }));

    mock.module("viem", () => ({
      createClient: mockCreateClient,
      custom: mockCustom,
      http: mockHttp,
    }));
  });

  test("should create an intent client with default transports when only bundlerTransport is provided", () => {
    const config: CreateIntentClientConfig = {
      bundlerTransport: mockBundlerTransport as Transport,
      version: "0.0.2",
    };

    createIntentClient(config);

    expect(mockCustom).toHaveBeenCalled();
    expect(mockCreateClient).toHaveBeenCalled();
    expect(mockExtend).toHaveBeenCalledTimes(3); // bundlerActions, kernelAccountClientActions, intentClientActions

    // Check that http was called for default transports
    expect(mockHttp).toHaveBeenCalledWith(ZERODEV_URLS.INTENT_SERVICE);
    expect(mockHttp).toHaveBeenCalledWith(ZERODEV_URLS.RELAYER_SERVICE_MAINNET);
  });

  test("should create an intent client with custom transports", () => {
    const config: CreateIntentClientConfig = {
      bundlerTransport: mockBundlerTransport as Transport,
      intentTransport: mockIntentTransport as Transport,
      relayerTransport: mockRelayerTransport as Transport,
      version: "0.0.2",
    };

    createIntentClient(config);

    expect(mockCustom).toHaveBeenCalled();
    expect(mockCreateClient).toHaveBeenCalled();
    expect(mockExtend).toHaveBeenCalledTimes(3);

    // Check that custom transports were used
    expect(mockHttp).not.toHaveBeenCalled();
  });

  test("should create an intent client with projectId", () => {
    const projectId = "test-project-id";
    const config: CreateIntentClientConfig = {
      bundlerTransport: mockBundlerTransport as Transport,
      projectId,
      version: "0.0.2",
    };

    createIntentClient(config);

    expect(mockHttp).toHaveBeenCalledWith(
      `${ZERODEV_URLS.INTENT_SERVICE}/${projectId}`,
    );
    expect(mockHttp).toHaveBeenCalledWith(
      `${ZERODEV_URLS.RELAYER_SERVICE_MAINNET}/${projectId}`,
    );
  });

  test("should use testnet relayer URL when chain.testnet is true", () => {
    const projectId = "test-project-id";
    const config: CreateIntentClientConfig = {
      bundlerTransport: mockBundlerTransport as Transport,
      projectId,
      chain: { testnet: true } as Chain,
      version: "0.0.2",
    };

    createIntentClient(config);

    expect(mockHttp).toHaveBeenCalledWith(
      `${ZERODEV_URLS.INTENT_SERVICE}/${projectId}`,
    );
    expect(mockHttp).toHaveBeenCalledWith(
      `${ZERODEV_URLS.RELAYER_SERVICE_TESTNET}/${projectId}`,
    );
  });

  test("should use custom transports when provided", () => {
    const projectId = "test-project-id";
    const config: CreateIntentClientConfig = {
      bundlerTransport: mockBundlerTransport as Transport,
      relayerTransport: mockRelayerTransport as Transport,
      intentTransport: mockIntentTransport as Transport,
      projectId,
      chain: { testnet: true } as Chain,
      version: "0.0.2",
    };

    createIntentClient(config);

    expect(mockHttp).not.toHaveBeenCalledWith(
      `${ZERODEV_URLS.INTENT_SERVICE}/${projectId}`,
    );
    expect(mockHttp).not.toHaveBeenCalledWith(
      `${ZERODEV_URLS.RELAYER_SERVICE_TESTNET}/${projectId}`,
    );
  });
});
