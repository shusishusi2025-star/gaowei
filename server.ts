import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("GEMINI_API_KEY is not configured in environment variables.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for body parsing
  app.use(express.json());

  // API 1: Verify Gemini connection status for Dashboard telemetry
  app.get("/api/status", (req, res) => {
    const hasKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY";
    res.json({
      success: true,
      provider: "Gemini Engine (Cloud Run Gateway)",
      hasKey,
      status: hasKey ? "Online" : "Offline Simulation",
      env: process.env.NODE_ENV || "development",
      time: new Date().toISOString()
    });
  });

  // API 2: Interactive AI Employee response dispatcher
  app.post("/api/chat", async (req, res) => {
    try {
      const { 
        message, 
        employeeRole, 
        employeeName, 
        employeeDesc, 
        industryName, 
        industryTagline,
        strategyName,
        strategyDesc,
        apiProvider = "gemini",
        ollamaEndpoint = "http://localhost:11434",
        ollamaModel = "llama3:8b",
        userLocation = "中国 北京（自动地缘检测定位中）",
        
        // AI Context Engine extension parameters
        currentPage = "智能工作台主控大盘 (Real-time Merchant Workbench Console)",
        storeTheme = "retro",
        brandPrimaryColor = "#1D9BF0",
        storeHeadline = "",
        currency = "CNY",
        productsCount = 0,
        ordersCount = 0,
        userLanguage = "zh-CN"
      } = req.body;

      if (!message) {
        res.status(400).json({ error: "Message input is required." });
        return;
      }

      // System instruction template with AI Context Engine to avoid dumb questioning 
      const systemInstruction = `你是一位高智商、极具智慧与实操执行力的数字员工（类似 Shopify Sidekick 智能伙伴）。
你的名字和岗位是：【${employeeRole} - ${employeeName}】
你目前所在的行业公司：【${industryName}】(${industryTagline})
当前已通过 IP/地缘高防网关免密识别到的创始人注册/营业地理位置：【${userLocation}】
当前公司选择的经营和运营战略：【${strategyName}】(${strategyDesc})
你的核心工作范畴：${employeeDesc}

=================[ 🚨 AI Context Engine 自动识别当前屏幕上下文 ]=================
为了避免复述或提问愚蠢问题，你已经自动获得了所有者当前的实机控制屏幕快照：
- 📂 当前创始人所在的业务页面/功能模块：【${currentPage}】
- 🎨 网店当前样式模板：【${storeTheme === 'dark' ? '潮冷暗黑 (dark)' : storeTheme === 'classic' ? '现代极简 (classic)' : '奶油法式 (retro)'}】
- 💅 品牌主题颜色: ${brandPrimaryColor}
- 📢 网店首屏标语/Slogan："${storeHeadline}"
- 📦 库存在售商品款数：${productsCount} 款
- 🚚 历史/待发货订单数：${ordersCount} 个
- 💴 结算本位法法定货币：${currency}
- 🌐 默认沟通语言集: ${userLanguage}
=============================================================================

请以此真实雇员身份，面对所有者（即用户）简单或者大方向的下达指令、或者询问，进行专业、高效、不拖泥带水、秒懂意图的直接回复：
1. **优先按当前所在页面理解**：当创始人只说几句抽象模糊的大方向，例如：
   - 如果他在【系统配置大仓 - 隐私合规与政策设置】页面只说“帮我上线”或“帮我处理一下”，你应当立刻判断其希望一键起草并部署符合他当前地理位置（如意大利、欧盟的 GDPR；或中国电商消协规范）的合规合同或退货政策。必须在句末直接附带对应的 [ACTION: WRITE_COMPLIANCE | 起草的具体文本] 并且写出来，不需要他多做解释。
   - 如果他在【SPU商品研发、建档仓】页面说“帮我优化一下”或“帮我写”，你应该根据当前行业 "${industryName}" 自动为他在在售的商品（当前有 ${productsCount} 款商品）起草一个极富质感、吸引人的商品升级案或文案，或者自动调用 [ACTION: ADD_PRODUCT] 一键帮他研发并发布一款利润率极高的新颖行货。
   - 如果他在【订单流核销履约】页面说“一键代发”或“我要发货”，你应直接调用标签 [ACTION: SHIP_ORDERS]，直接为他跟单处理 ${ordersCount} 个件的一键发货包揽，不要推诿！
   - 如果他在【直通车竞价/营销中心】说“我要卖全欧洲”或“帮我拉一下”，你应该立刻理解他的痛点并一键用 [ACTION: SET_BUDGET | 880] 把直通车每日曝光预算设到新高度！
2. **禁止重复询问系统已知信息**（如已知国家在 ${userLocation}、已知在 "${currentPage}" 页面、当前主题是 ${storeTheme}），直接大步流星开干，显示出无可匹敌的自动化代理人的实操水准。
3. 语言表达：自然、沉着、直击要害，带有该行当行话特色的语感。
4. 回复结构：不用任何客套寒暄、不要输出背书式的分析或前置助手说明。
5. 字数控制：保持高度凝练，控制在 180 字以内，突出极智与强干。
6. **(Sidekick 后台实地操作级能力标签列表)**:
作为掌握实机控制能力的 AI 面板秘书，如果创始人下达了“做/修改/设定/执行”等具体操作指令或需要死死咬住，你应在专业文字回复后，在文字末尾追加一串具体的物理动作标签：
- 更换网店主图标语:  [ACTION: SET_HEADLINE | 标语文字]
- 更换首页视觉主题:  [ACTION: SET_THEME | retro|dark|classic] (选择对应的主题ID)
- 研发并自动上架产品: [ACTION: ADD_PRODUCT | 商品品名 | 售价] (售价需为纯数字，如129)
- 一键完成订单自动分包并极速发顺丰快递: [ACTION: SHIP_ORDERS]
- 解决客户纠纷调停(解救李阿姨投诉): [ACTION: RESOLVE_COMPLAINT]
- 调整并更改直通车营销每日资金预算:  [ACTION: SET_BUDGET | 预算金额] (金额需为50~1000内的数字)
- 自动起草并一键热发布商户合规政策/退款政策文件 (在面临‘帮我起草隐私’、‘写个合规政策’、‘帮我配置隐私’或涉及地缘法务时强制使用此标签一键帮写并写入设置大仓): [ACTION: WRITE_COMPLIANCE | 具体的隐私保密退货完整文本]

注意：如果用户只是闲聊或探讨大方向经营学知识，而非需要你具体操作或改动，则**绝对不能**附带任何 [ACTION] 标签。`;

      // Check if API key exists for Gemini
      try {
        const ai = getGeminiClient();
        
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: message,
          config: {
            systemInstruction,
            temperature: 0.85,
            topP: 0.9,
          },
        });

        const reply = response.text || "接收到了您的指示，我已经在落实相应的数字要素调整。";
        res.json({ success: true, reply, source: "Gemini Cloud Live Engine" });
      } catch (err: any) {
        console.warn("Gemini Live server call failed, returning simulated responsive fallback:", err.message);
        // Fallback simulated intelligence logic if Gemini is offline
        res.json({ 
          success: false, 
          error: err.message, 
          source: "Offline Simulation",
          reply: "" // Client handles simulated logic when success is false or if they want to reuse local rules
        });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Internal server error" });
    }
  });

  // Serve static assets OR handle Vite in middleware mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AI Host Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
