
import { GoogleGenAI, Type } from "@google/genai";
import { DeviceType, GeneratedConfig, ComplianceIssue, TopologyNode } from "../types";

// Hàm khởi tạo AI instance cục bộ để đảm bảo lấy đúng API_KEY từ process.env tại thời điểm gọi
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateCiscoConfig = async (
  deviceType: DeviceType,
  description: string
): Promise<GeneratedConfig> => {
  const ai = getAI();
  const model = 'gemini-3-pro-preview';
  
  const prompt = `Bạn là một chuyên gia CCIE. Hãy thực hiện yêu cầu cấu hình sau cho ${deviceType}: "${description}".
  Yêu cầu trả về JSON chuẩn gồm:
  1. cliCommands: Lệnh cấu hình chính (sử dụng tối ưu như interface range, portfast nếu cần).
  2. preCheckCommands: Danh sách các lệnh 'show' để kiểm tra trạng thái trước khi chạy.
  3. postCheckCommands: Danh sách các lệnh 'show' để xác minh sau khi cấu hình.
  4. rollbackCommands: Các lệnh để hoàn tác hoàn toàn cấu hình này.
  5. explanation: Giải thích ngắn gọn.
  6. bestPractices: 3 lưu ý bảo mật liên quan.`;

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

export const auditConfiguration = async (config: string): Promise<ComplianceIssue[]> => {
  const ai = getAI();
  const model = 'gemini-3-flash-preview';
  const prompt = `Phân tích đoạn cấu hình Cisco sau và tìm các lỗi bảo mật hoặc vi phạm Best Practice (như Telnet chưa tắt, password cleartext, v.v.):\n\n${config}`;

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
          },
          required: ["severity", "issue", "remediation"]
        }
      }
    }
  });
  return JSON.parse(response.text || "[]");
};

export const analyzeTopology = async (cdpData: string): Promise<TopologyNode[]> => {
  const ai = getAI();
  const model = 'gemini-3-flash-preview';
  const prompt = `Phân tích đầu ra của lệnh 'show cdp neighbors' sau và chuyển thành danh sách JSON các node kết nối:\n\n${cdpData}`;

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

export const getDeviceHealthAdvice = async (
  deviceType: DeviceType,
  metrics: { cpu: number; memory: number; temp: number }
): Promise<string[]> => {
  const ai = getAI();
  const model = 'gemini-3-flash-preview';
  const prompt = `Phân tích thông số sức khỏe sau của thiết bị ${deviceType}:
  - CPU: ${metrics.cpu}%
  - Memory: ${metrics.memory}%
  - Temperature: ${metrics.temp}°C
  
  Hãy đưa ra 3 lời khuyên kỹ thuật ngắn gọn (Tiếng Việt) để tối ưu hóa hoặc cảnh báo nếu cần thiết. Trả về dưới dạng mảng JSON các chuỗi.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    return ["Không thể phân tích dữ liệu sức khỏe lúc này."];
  }
};
