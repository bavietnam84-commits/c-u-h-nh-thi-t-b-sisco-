
import { GoogleGenAI, Type } from "@google/genai";
import { DeviceType, GeneratedConfig, ComplianceIssue, TopologyNode, DeviceNetworkSummary, TopologyData } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateCiscoConfig = async (
  deviceType: DeviceType,
  description: string
): Promise<GeneratedConfig> => {
  const ai = getAI();
  const model = 'gemini-3-pro-preview';
  
  const prompt = `Bạn là một chuyên gia CCIE. Hãy thực hiện yêu cầu cấu hình sau cho ${deviceType}: "${description}".
  Yêu cầu trả về JSON chuẩn gồm:
  1. cliCommands: Lệnh cấu hình chính.
  2. preCheckCommands: Danh sách lệnh 'show' trước khi chạy.
  3. postCheckCommands: Danh sách lệnh 'show' sau cấu hình.
  4. rollbackCommands: Lệnh hoàn tác.
  5. explanation: Giải thích.
  6. bestPractices: 3 lưu ý bảo mật.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          cliCommands: { type: Type.STRING },
          preCheckCommands: { type: Type.ARRAY, items: { type: Type.STRING } },
          postCheckCommands: { type: Type.ARRAY, items: { type: Type.STRING } },
          rollbackCommands: { type: Type.STRING },
          explanation: { type: Type.STRING },
          bestPractices: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["cliCommands", "preCheckCommands", "postCheckCommands", "rollbackCommands", "explanation", "bestPractices"]
      }
    }
  });

  return JSON.parse(response.text || "{}") as GeneratedConfig;
};

export const parseVisualTopology = async (config: string, deviceType: DeviceType, discoveredNodes: TopologyNode[]): Promise<TopologyData> => {
  const ai = getAI();
  const model = 'gemini-3-flash-preview';
  
  const prompt = `Dựa trên cấu hình CLI và danh sách lân cận sau, hãy tạo cấu trúc JSON cho bản đồ topo mạng.
  Thiết bị chính: ${deviceType}
  CLI Config: ${config}
  Neighbor Nodes: ${JSON.stringify(discoveredNodes)}
  
  Trả về JSON có:
  - nodes: [{id, name, type (SWITCH/FIREWALL/WIFI/MODEM/NEIGHBOR), status (active/configured/idle)}]
  - links: [{source, target, label (interface name), isConfiguring (boolean)}]`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          nodes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                type: { type: Type.STRING },
                status: { type: Type.STRING }
              }
            }
          },
          links: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                source: { type: Type.STRING },
                target: { type: Type.STRING },
                label: { type: Type.STRING },
                isConfiguring: { type: Type.BOOLEAN }
              }
            }
          }
        }
      }
    }
  });

  return JSON.parse(response.text || '{"nodes":[],"links":[]}');
};

export const auditConfiguration = async (config: string): Promise<ComplianceIssue[]> => {
  const ai = getAI();
  const model = 'gemini-3-flash-preview';
  const prompt = `Phân tích cấu hình Cisco tìm lỗi bảo mật:\n\n${config}`;
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            severity: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
            issue: { type: Type.STRING },
            remediation: { type: Type.STRING }
          }
        }
      }
    }
  });
  return JSON.parse(response.text || "[]");
};

export const analyzeTopology = async (cdpData: string): Promise<TopologyNode[]> => {
  const ai = getAI();
  const model = 'gemini-3-flash-preview';
  const prompt = `Phân tích CDP neighbors:\n\n${cdpData}`;
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            localInterface: { type: Type.STRING },
            neighborDevice: { type: Type.STRING },
            neighborInterface: { type: Type.STRING },
            platform: { type: Type.STRING }
          }
        }
      }
    }
  });
  return JSON.parse(response.text || "[]");
};

export const parseDeviceNetworkInfo = async (output: string): Promise<DeviceNetworkSummary> => {
  const ai = getAI();
  const model = 'gemini-3-flash-preview';
  const response = await ai.models.generateContent({
    model,
    contents: `Parse network info: ${output}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          hostname: { type: Type.STRING },
          uptime: { type: Type.STRING },
          interfaces: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                interface: { type: Type.STRING },
                ipAddress: { type: Type.STRING },
                status: { type: Type.STRING },
                protocol: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });
  return JSON.parse(response.text || "{}") as DeviceNetworkSummary;
};

export const getDeviceHealthAdvice = async (deviceType: DeviceType, metrics: any): Promise<string[]> => {
  const ai = getAI();
  const model = 'gemini-3-flash-preview';
  const response = await ai.models.generateContent({
    model,
    contents: `Health advice for ${deviceType}: ${JSON.stringify(metrics)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
    }
  });
  return JSON.parse(response.text || "[]");
};
