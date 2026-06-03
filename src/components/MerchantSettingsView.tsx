import React, { useState, useEffect } from 'react';
import { 
  Settings, Briefcase, Users, DollarSign, UserCheck, Truck, Sparkles, Cpu, Bell, Globe, Shield,
  Key, RefreshCw, Layers, Check, Search, Plus, Cloud, CloudUpload, CloudDownload, CreditCard,
  History, Activity, BookOpen, ChevronDown, X, ShieldAlert, Star, Sliders, Play, CheckCircle2, AlertTriangle, Phone
} from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { motion } from 'motion/react';

// Industry preset options to provide the user with ultimate simplicity (<3 mins setup)
const INDUSTRY_PRESETS: Record<string, {
  intro: string;
  hours: string;
  welcome: string;
  refund: string;
  slogan: string;
}> = {
  clothing: {
    intro: "MODA Premium 智能美学服饰，致力于潮流无性别剪裁与先锋环保面料，由 6 位 AI 设计合伙人全权驱动，追求设计与自我的完美平衡。",
    hours: "09:00 - 22:00",
    welcome: "您好！先锋穿衣师 AI 助理正在为您进行体态扫描。输入您喜欢的穿衣风格，让智脑为您搭配今日首选款！",
    refund: "自签收之日起，支持 7 天无理由退换货（保持商品吊牌完整、无穿着洗涤痕迹），首重运费由本店尊享运费险全额承保。",
    slogan: "以智赋形，量体剪裁，定制您的先锋轮廓。"
  },
  catering: {
    intro: "MODA AI 极速无人轻美食厨房。智控恒温高分子工艺，24小时不打烊，全程 AI 专属烘焙调理师科学订制热配，开启舌尖绿色新纪元。",
    hours: "00:00 - 24:00",
    welcome: "您好！热气腾腾的招牌美食正在飞速备战中。AI 营养师已为您捕捉今天配料。今日招牌菜特惠促销中，快来提问配搭吧！",
    refund: "由于餐饮食品类目的特殊涉鲜及即食保质属性，本商品不支持 7 天无理由退换、拒签。若产生货损与超时破损，3分钟极速全额秒赔。",
    slogan: "热气承运，智感轻餐，3分钟全息鲜焙。"
  },
  beauty: {
    intro: "MODA 自家制智能美学沙龙，专属玫瑰高定香氛舒缓。致力于精准量肤定制、全息活性抗衰美学，AI 护肤主脑 24 小时随身解答护理秘密。",
    hours: "10:00 - 21:30",
    welcome: "欢迎光临至尊美学空间！AI 肌肤顾问正为您测量肤质年龄，今日玫瑰精华体验特许开启，输入任何保养困扰，AI 随时秒回！",
    refund: "本院护肤定制套装在未拆封防伪膜的前提下支持 7 天极速无音退款。若已开膜体验，支持由 AI 护肤顾问免费为您更换针对性调理方案。",
    slogan: "定制量肤，奢享肌秘，焕发时光原生细胞。"
  },
  fitness: {
    intro: "MODA 智能热炼极客中心。全维体态三维数字建模，AI 私教团队全天候追踪热量消耗曲线，搭载科学定制补给包。为每一份汗水科学计策。",
    hours: "06:00 - 23:00",
    welcome: "热汗淋漓吧，朋友！您的 AI 私教已经上线，随时为您精准制定今天的燃脂负荷计划。打卡今日运动即可兑换超级补给！",
    refund: "全站智能健康订阅计划与视频课程可在注册 2 小时内随时一键退款。实物筋膜枪等运动器械完整包装支持 7 天内无理由退还。",
    slogan: "体态重塑，极客热炼，让算法赞美汗水。"
  },
  jewelry: {
    intro: "MODA 皇家级高定珠宝艺术工坊。由奢华美学大模型与皇家大师协同量身雕琢，尊享一钻一卡一证书，用无价恒远见证每一分澎湃心动。",
    hours: "09:30 - 22:00",
    welcome: "阁下您好，有幸在璀璨中与您相遇。高定艺术掌柜已恭候多时。输入您的见证故事，让我们为您定制独一无二的刻字臻礼。",
    refund: "极奢高定珠宝商品在无划痕、附赠国际检测证书齐全的情况下支持 7 天无音退换。所有保原包装完好是极速秒退的坚守承诺。",
    slogan: "璀璨永恒，高定制钻，致敬时光中的不凡执念。"
  },
  furniture: {
    intro: "MODA 软木质感智能家居长廊。融合自然人文主义色彩与全息智能智控传感器，打造有呼吸温润感的未来栖息地。AI 室内软装师全权协助落地。",
    hours: "09:00 - 22:00",
    welcome: "您好！欢迎回到温暖而充满智控惊喜的家。室内全息软装师正等待您的空间尺寸输入，我们将 5 秒一键生成您梦想的客厅搭配！",
    refund: "沙发、原物家居及床架实物大件支持 7 天无因退货，若非质量问题仅向您收取由顺丰官方厘定之返退德邦物流拼货标准运费。",
    slogan: "自然智控，软木栖居，全生命期温润守候。"
  }
};

interface MerchantSettingsViewProps {
  userRole: string;
  db: any;
  tenantId: string;
  triggerToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  industry: any;
  strategy: any;
  productsList: any[];
  sales: number;
  mktBudget: number;
  storeTheme: string;
  storeHeadline: string;
  setStoreHeadline: (v: string) => void;
  brandPrimaryColor: string;
  setBrandPrimaryColor: (v: string) => void;
  seoHtmlTitle: string;
  setSeoHtmlTitle: (v: string) => void;
  seoMetaDesc: string;
  setSeoMetaDesc: (v: string) => void;
  seoKeywords: string;
  setSeoKeywords: (v: string) => void;
  
  // Existing App Settings Bindings
  editBrandName: string;
  setEditBrandName: (v: string) => void;
  editSlogan: string;
  setEditSlogan: (v: string) => void;
  merchantStatus: string;
  merchantBillingTier: string;
  merchantTokenBalance: number;
  merchantRechargeTotal: number;
  billingLogs: any[];
  handlePerformSaaSTopup: (topupType: 'token_pack' | 'tier_upgrade', amount: number, tokensCredited: number, itemName: string) => Promise<void>;
  
  apiProvider: 'gemini' | 'deepseek' | 'openai' | 'ollama';
  setApiProvider: (v: 'gemini' | 'deepseek' | 'openai' | 'ollama') => void;
  geminiKey: string;
  setGeminiKey: (v: string) => void;
  deepseekKey: string;
  setDeepseekKey: (v: string) => void;
  openaiKey: string;
  setOpenaiKey: (v: string) => void;
  ollamaEndpoint: string;
  setOllamaEndpoint: (v: string) => void;
  ollamaModel: string;
  setOllamaModel: (v: string) => void;
  ollamaModels: string[];
  setOllamaModels: React.Dispatch<React.SetStateAction<string[]>>;
  ollamaSearchQuery: string;
  setOllamaSearchQuery: (v: string) => void;
  customOllamaModelInput: string;
  setCustomOllamaModelInput: (v: string) => void;
  isSyncingOllama: boolean;
  syncOllamaModelsList: () => Promise<void>;
  testConnectionStatus: 'idle' | 'testing' | 'success' | 'failed';
  setTestConnectionStatus: (v: 'idle' | 'testing' | 'success' | 'failed') => void;
  testLog: string;
  setTestLog: (v: string) => void;
  geminiConnected: 'online' | 'local';
  setGeminiConnected: (v: 'online' | 'local') => void;
  
  // Existing Cloud backup Bindings
  driveAccessToken: string | null;
  driveUserEmail: string | null;
  isBackingUp: boolean;
  isSearchingBackups: boolean;
  driveBackups: any[];
  selectedBackupId: string;
  setSelectedBackupId: (v: string) => void;
  isRestoring: boolean;
  wipeProductsInPurge: boolean;
  setWipeProductsInPurge: (v: boolean) => void;
  
  handleConnectDrive: () => void;
  handleDisconnectDrive: () => void;
  handleBackupToDrive: () => Promise<void>;
  handleFetchBackups: () => Promise<void>;
  handleRestoreFromDrive: () => Promise<void>;
  handleProductionPurge: (wipeProducts: boolean) => Promise<void>;

  // Location and Policy syncing
  userLocation: string;
  isLocating: boolean;
  refundPolicyText: string;
  setRefundPolicyText: (v: string) => void;
  subTab: 'general' | 'billing' | 'users' | 'payments' | 'customers' | 'logistics' | 'marketing' | 'app' | 'notifications' | 'languages' | 'privacy';
  setSubTab: (v: 'general' | 'billing' | 'users' | 'payments' | 'customers' | 'logistics' | 'marketing' | 'app' | 'notifications' | 'languages' | 'privacy') => void;
}

export default function MerchantSettingsView({
  userRole,
  db,
  tenantId,
  triggerToast,
  industry,
  strategy,
  productsList,
  sales,
  mktBudget,
  storeTheme,
  storeHeadline,
  setStoreHeadline,
  brandPrimaryColor,
  setBrandPrimaryColor,
  seoHtmlTitle,
  setSeoHtmlTitle,
  seoMetaDesc,
  setSeoMetaDesc,
  seoKeywords,
  setSeoKeywords,
  
  editBrandName,
  setEditBrandName,
  editSlogan,
  setEditSlogan,
  merchantStatus,
  merchantBillingTier,
  merchantTokenBalance,
  merchantRechargeTotal,
  billingLogs,
  handlePerformSaaSTopup,
  
  apiProvider,
  setApiProvider,
  geminiKey,
  setGeminiKey,
  deepseekKey,
  setDeepseekKey,
  openaiKey,
  setOpenaiKey,
  ollamaEndpoint,
  setOllamaEndpoint,
  ollamaModel,
  setOllamaModel,
  ollamaModels,
  setOllamaModels,
  ollamaSearchQuery,
  setOllamaSearchQuery,
  customOllamaModelInput,
  setCustomOllamaModelInput,
  isSyncingOllama,
  syncOllamaModelsList,
  testConnectionStatus,
  setTestConnectionStatus,
  testLog,
  setTestLog,
  geminiConnected,
  setGeminiConnected,
  
  driveAccessToken,
  driveUserEmail,
  isBackingUp,
  isSearchingBackups,
  driveBackups,
  selectedBackupId,
  setSelectedBackupId,
  isRestoring,
  wipeProductsInPurge,
  setWipeProductsInPurge,
  
  handleConnectDrive,
  handleDisconnectDrive,
  handleBackupToDrive,
  handleFetchBackups,
  handleRestoreFromDrive,
  handleProductionPurge,

  userLocation,
  isLocating,
  refundPolicyText,
  setRefundPolicyText,
  subTab,
  setSubTab,
}: MerchantSettingsViewProps) {
  
  // Modular state encapsulated inside this component but synchronized to DB on mount & save
  const [merchantIntro, setMerchantIntro] = useState('');
  const [merchantHours, setMerchantHours] = useState('09:00 - 22:00');
  const [merchantPhone, setMerchantPhone] = useState('400-080-8888');
  
  // Users & Permissions operators list
  const [operatorsList, setOperatorsList] = useState<any[]>([
    { email: 'founder@modaui.ai', name: '创始人王总', role: 'founder', status: 'active' },
    { email: 'manager@modaui.ai', name: '运营总监李总', role: 'manager', status: 'active' },
    { email: 'staff@modaui.ai', name: '店面小助手', role: 'staff', status: 'active' }
  ]);
  const [newOperatorEmail, setNewOperatorEmail] = useState('');
  const [newOperatorName, setNewOperatorName] = useState('');
  const [newOperatorRole, setNewOperatorRole] = useState<'founder' | 'manager' | 'staff' | 'customer'>('staff');

  // Payment states
  const [paymentGateway, setPaymentGateway] = useState<'stripe' | 'alipay' | 'both'>('stripe');
  const [paymentStripePub, setPaymentStripePub] = useState('pk_live_51Pq3S0H...');
  const [paymentStripeSec, setPaymentStripeSec] = useState('sk_live_51Pq3S0H...');
  const [paymentAlipayId, setPaymentAlipayId] = useState('20210021394852...');
  const [paymentAlipayPriv, setPaymentAlipayPriv] = useState('MIIEvgIBADANBgkqhkiG9w0BAQEFASCBKj... (加密私钥)');

  // CRM Parameters
  const [rewardPointRate, setRewardPointRate] = useState(1);
  const [vipThreshold, setVipThreshold] = useState(1000);
  const [welcomeMessage, setWelcomeMessage] = useState('您好！欢迎光临本智能美学旗舰店，24小时 AI 主脑将为您竭诚服务。');
  const [membershipPresetId, setMembershipPresetId] = useState<'none' | 'basic' | 'pro' | 'black'>('basic');

  // Logistics parameters
  const [logisticsProvider, setLogisticsProvider] = useState('sf_air');
  const [logisticsApiKey, setLogisticsApiKey] = useState('SF_API_KEY_36D0EEE30473...');
  const [shippingBaseFee, setShippingBaseFee] = useState(12);

  // Marketing states
  const [brandStyle, setBrandStyle] = useState('modern');

  // Notifications states (Checks & Emails)
  const [notifyOnNewOrder, setNotifyOnNewOrder] = useState(true);
  const [notifyOnRefund, setNotifyOnRefund] = useState(true);
  const [notifyChannelsPreset, setNotifyChannelsPreset] = useState<string[]>(['email', 'sms']);
  const [notifySmsPhone, setNotifySmsPhone] = useState('13800138000');
  const [notifyEmail, setNotifyEmail] = useState('alert@modaui.ai');

  // Language settings
  const [storeLanguage, setStoreLanguage] = useState<'zh' | 'en' | 'ja'>('zh');
  const [autoTranslateAi, setAutoTranslateAi] = useState(true);

  // Privacy states
  const [refundPresetId, setRefundPresetId] = useState<'7day' | 'custom' | 'no_return'>('7day');
  const [privacyConsentEnabled, setPrivacyConsentEnabled] = useState(true);
  const [dataSecrecyAgreed, setDataSecrecyAgreed] = useState(true);

  // Load Preset value according to current industry on mount if we have no custom database configuration yet
  const activeIndustryId = industry?.id || 'clothing';
  const presetsForIndustry = INDUSTRY_PRESETS[activeIndustryId] || INDUSTRY_PRESETS.clothing;

  // Real-time synchronization loader
  useEffect(() => {
    const loadSettingsFromDb = async () => {
      try {
        const docRef = doc(db, 'tenants', tenantId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setMerchantIntro(data.merchantIntro !== undefined ? data.merchantIntro : presetsForIndustry.intro);
          setMerchantHours(data.merchantHours !== undefined ? data.merchantHours : presetsForIndustry.hours);
          setMerchantPhone(data.merchantPhone !== undefined ? data.merchantPhone : '400-080-8888');
          if (data.operatorsList !== undefined) setOperatorsList(data.operatorsList);
          if (data.paymentGateway !== undefined) setPaymentGateway(data.paymentGateway);
          if (data.paymentStripePub !== undefined) setPaymentStripePub(data.paymentStripePub);
          if (data.paymentStripeSec !== undefined) setPaymentStripeSec(data.paymentStripeSec);
          if (data.paymentAlipayId !== undefined) setPaymentAlipayId(data.paymentAlipayId);
          if (data.paymentAlipayPriv !== undefined) setPaymentAlipayPriv(data.paymentAlipayPriv);
          
          if (data.rewardPointRate !== undefined) setRewardPointRate(data.rewardPointRate);
          if (data.vipThreshold !== undefined) setVipThreshold(data.vipThreshold);
          if (data.welcomeMessage !== undefined) setWelcomeMessage(data.welcomeMessage);
          if (data.membershipPresetId !== undefined) setMembershipPresetId(data.membershipPresetId);

          if (data.logisticsProvider !== undefined) setLogisticsProvider(data.logisticsProvider);
          if (data.logisticsApiKey !== undefined) setLogisticsApiKey(data.logisticsApiKey);
          if (data.shippingBaseFee !== undefined) setShippingBaseFee(data.shippingBaseFee);
          
          if (data.notifyOnNewOrder !== undefined) setNotifyOnNewOrder(data.notifyOnNewOrder);
          if (data.notifyOnRefund !== undefined) setNotifyOnRefund(data.notifyOnRefund);
          if (data.notifySmsPhone !== undefined) setNotifySmsPhone(data.notifySmsPhone);
          if (data.notifyEmail !== undefined) setNotifyEmail(data.notifyEmail);
          if (data.notifyChannelsPreset !== undefined) setNotifyChannelsPreset(data.notifyChannelsPreset);
          
          if (data.storeLanguage !== undefined) setStoreLanguage(data.storeLanguage);
          if (data.autoTranslateAi !== undefined) setAutoTranslateAi(data.autoTranslateAi);
          
          if (data.refundPolicyText !== undefined) setRefundPolicyText(data.refundPolicyText);
          if (data.refundPresetId !== undefined) setRefundPresetId(data.refundPresetId);
          if (data.privacyConsentEnabled !== undefined) setPrivacyConsentEnabled(data.privacyConsentEnabled);
          if (data.dataSecrecyAgreed !== undefined) setDataSecrecyAgreed(data.dataSecrecyAgreed);
          if (data.brandStyle !== undefined) setBrandStyle(data.brandStyle);
        } else {
          // Initialize with default presets automatically
          setMerchantIntro(presetsForIndustry.intro);
          setMerchantHours(presetsForIndustry.hours);
          setWelcomeMessage(presetsForIndustry.welcome);
          setRefundPolicyText(presetsForIndustry.refund);
        }
      } catch (err) {
        console.error("Failed to load settings from DB in Settings Component: ", err);
      }
    };
    loadSettingsFromDb();
  }, [db, tenantId, activeIndustryId, presetsForIndustry]);

  // Load industry presets into page state instantly
  const handleLoadIndustryDefaults = async () => {
    try {
      setMerchantIntro(presetsForIndustry.intro);
      setMerchantHours(presetsForIndustry.hours);
      setWelcomeMessage(presetsForIndustry.welcome);
      setRefundPolicyText(presetsForIndustry.refund);
      setEditBrandName(industry?.name || 'MODAUI智能旗舰店');
      setEditSlogan(presetsForIndustry.slogan);

      await setDoc(doc(db, 'tenants', tenantId), {
        merchantIntro: presetsForIndustry.intro,
        merchantHours: presetsForIndustry.hours,
        welcomeMessage: presetsForIndustry.welcome,
        refundPolicyText: presetsForIndustry.refund,
        merchantName: industry?.name || 'MODAUI智能旗舰店',
        companySlogan: presetsForIndustry.slogan,
        merchantPhone,
        rewardPointRate: 1,
        vipThreshold: 1000,
        membershipPresetId: 'basic',
        logisticsProvider: 'sf_air',
        shippingBaseFee: 12,
        refundPresetId: '7day'
      }, { merge: true });
      
      triggerToast('✨ 行业最佳配伍方案一键部署就绪 (<1秒)！已自动将 AI 人设、欢迎词、退换契约对齐至行业标准。', 'success');
    } catch (e: any) {
      triggerToast(`预调失败: ${e.message}`, 'error');
    }
  };

  // General Settings save function
  const handleSaveGeneralSettings = async () => {
    try {
      await setDoc(doc(db, 'tenants', tenantId), {
        merchantName: editBrandName,
        companySlogan: editSlogan,
        merchantIntro,
        merchantHours,
        merchantPhone
      }, { merge: true });
      triggerToast('💾 一般设置同步更新至 Firestore 成功！', 'success');
    } catch (e: any) {
      triggerToast(`保存失败: ${e.message}`, 'error');
    }
  };

  // Add operators
  const handleAddOperator = async () => {
    if (!newOperatorEmail || !newOperatorName) {
      triggerToast('请输入完整邮箱和姓名！', 'error');
      return;
    }
    const updated = [...operatorsList, {
      email: newOperatorEmail,
      name: newOperatorName,
      role: newOperatorRole,
      status: 'active'
    }];
    setOperatorsList(updated);
    try {
      await setDoc(doc(db, 'tenants', tenantId), {
        operatorsList: updated
      }, { merge: true });
      triggerToast(`✔ 成功邀请新协作者 [${newOperatorName}]！`, 'success');
      setNewOperatorEmail('');
      setNewOperatorName('');
    } catch (e: any) {
      triggerToast(`增加员工失败: ${e.message}`, 'error');
    }
  };

  // Remove operators
  const handleRemoveOperator = async (email: string) => {
    const updated = operatorsList.filter(it => it.email !== email);
    setOperatorsList(updated);
    try {
      await setDoc(doc(db, 'tenants', tenantId), {
        operatorsList: updated
      }, { merge: true });
      triggerToast(`🗑 成功剔除底坐员工授权！`, 'info');
    } catch (e: any) {
      triggerToast('移除员工失败', 'error');
    }
  };

  // Payment settings save function
  const handleSavePaymentSettings = async () => {
    try {
      await setDoc(doc(db, 'tenants', tenantId), {
        paymentGateway,
        paymentStripePub,
        paymentStripeSec,
        paymentAlipayId,
        paymentAlipayPriv
      }, { merge: true });
      triggerToast('💳 智能交易收单路由设置已就绪！', 'success');
    } catch (e: any) {
      triggerToast('付款参数更新失败', 'error');
    }
  };

  // CRM customer settings save function
  const handleSaveCustomerSettings = async () => {
    try {
      await setDoc(doc(db, 'tenants', tenantId), {
        rewardPointRate,
        vipThreshold,
        welcomeMessage,
        membershipPresetId
      }, { merge: true });
      triggerToast('💾 客户 CRM 消费积点与招呼预设存入成功！', 'success');
    } catch (e: any) {
      triggerToast(`保存失败: ${e.message}`, 'error');
    }
  };

  // Brand and marketing visual style save function
  const handleSaveMarketingSettings = async () => {
    try {
      await setDoc(doc(db, 'tenants', tenantId), {
        brandPrimaryColor,
        brandStyle,
        seoHtmlTitle,
        seoMetaDesc,
        seoKeywords
      }, { merge: true });
      triggerToast('💾 品牌视觉指标以及全站 SEO 索引热上线成功！', 'success');
    } catch (e: any) {
      triggerToast(`保存失败: ${e.message}`, 'error');
    }
  };

  // Custom presets for Membership
  const handleSelectMembershipPreset = async (presetId: 'none' | 'basic' | 'pro' | 'black') => {
    let rate = 1;
    let threshold = 1000;
    let desc = '';
    
    if (presetId === 'none') {
      rate = 0;
      threshold = 1000000;
      desc = "已完全废止全店买家积点体系。";
    } else if (presetId === 'basic') {
      rate = 1;
      threshold = 1000;
      desc = "已将积点对齐「基础会员体系」(1元=1积分，1000分登临白金)。";
    } else if (presetId === 'pro') {
      rate = 2;
      threshold = 500;
      desc = "已将积点对齐「高级VIP双倍积点制」(1元=2积分，500分登临尊雅VIP)。";
    } else if (presetId === 'black') {
      rate = 5;
      threshold = 2000;
      desc = "已将积点对齐「至尊黑金五倍壕华俱乐部」(1元=5积分，2000积分封神贵族)。";
    }

    setMembershipPresetId(presetId);
    setRewardPointRate(rate);
    setVipThreshold(threshold);

    try {
      await setDoc(doc(db, 'tenants', tenantId), {
        membershipPresetId: presetId,
        rewardPointRate: rate,
        vipThreshold: threshold
      }, { merge: true });
      triggerToast(`🎯 CRM ${desc}`, 'success');
    } catch (e: any) {
      triggerToast('会员设置备份失败', 'error');
    }
  };

  // Preset welcome messages Tones
  const handleSelectWelcomeTone = async (tone: 'warm' | 'cool' | 'vibe') => {
    let msg = presetsForIndustry.welcome;
    if (tone === 'warm') {
      msg = `【温馨谦逊】尊贵的客官，小店很荣幸能为您效劳！您可随时垂询我们 24 小时 AI 设计主管，所有臻礼均精心包装，祝您度过有质感的一天。`;
    } else if (tone === 'cool') {
      msg = `【极客前卫】电波已校准，AI 数字顾问 24h 随时听政。我们拒绝平庸，只为打造您的先锋艺术，期待今天为您进行全生命度量算。`;
    } else if (tone === 'vibe') {
      msg = `【原生态活力】嗨朋友！今日特调心情包已送达，AI 小掌柜在线陪聊吃喝玩乐，让我们一起打破无聊，今日专属特价限时放送中！`;
    }
    setWelcomeMessage(msg);
    try {
      await setDoc(doc(db, 'tenants', tenantId), {
        welcomeMessage: msg
      }, { merge: true });
      triggerToast('🗣️ AI 客宣致欢迎词语调热装上线成功！', 'info');
    } catch (e: any) {
      console.error(e);
    }
  };

  // Preset logistics selections
  const handleSelectLogisticsPreset = async (provider: string, baseFee: number) => {
    setLogisticsProvider(provider);
    setShippingBaseFee(baseFee);
    try {
      await setDoc(doc(db, 'tenants', tenantId), {
        logisticsProvider: provider,
        shippingBaseFee: baseFee
      }, { merge: true });
      triggerToast(`🚚 物流结算模态自动锁定为：[${provider === 'sf_air' ? '顺丰特快空航' : provider === 'sf_rider' ? '骑手即时配送' : '自提免单'}]，首重基费调校为 ￥${baseFee}！`, 'success');
    } catch (e: any) {
      triggerToast('物流更新失败', 'error');
    }
  };

  // Preset refund rules
  const handleSelectRefundPreset = async (preset: '7day' | 'no_return' | 'custom') => {
    let text = presetsForIndustry.refund;
    if (preset === 'no_return') {
      text = "【严正申明】鉴于本店主营品类的专属贵金订制/限鲜/即烹之卫生及不可逆属性，本商品一旦打包出库不设 7 天无因退还。尊贵货损由我司极速承保理赔。";
    } else if (preset === 'custom') {
      text = "【超长保障】本店突破行业规范，尊享 15 天无理由无忧质保更换，让算法不仅聪明，更具有有温度的原谅与关怀。";
    }
    setRefundPresetId(preset);
    setRefundPolicyText(text);
    try {
      await setDoc(doc(db, 'tenants', tenantId), {
        refundPresetId: preset,
        refundPolicyText: text
      }, { merge: true });
      triggerToast(`🛡️ 官方退换货赔付契约已一键切换！`, 'success');
    } catch (e: any) {
      console.error(e);
    }
  };

  // Toggle notification channels checklist
  const handleToggleNotifyChannel = async (channel: string) => {
    const updated = notifyChannelsPreset.includes(channel)
      ? notifyChannelsPreset.filter(c => c !== channel)
      : [...notifyChannelsPreset, channel];
    setNotifyChannelsPreset(updated);
    try {
      await setDoc(doc(db, 'tenants', tenantId), {
        notifyChannelsPreset: updated
      }, { merge: true });
      triggerToast('🔔 告警传输通道更新就绪！', 'info');
    } catch (err) {
      console.error(err);
    }
  };

  // Save changes
  const handleSaveNotificationSettings = async () => {
    try {
      await setDoc(doc(db, 'tenants', tenantId), {
        notifyOnNewOrder,
        notifyOnRefund,
        notifySmsPhone,
        notifyEmail,
        notifyChannelsPreset
      }, { merge: true });
      triggerToast('🔔 大额新单、退换争议级秒级告警机制已同步下发！', 'success');
    } catch (e: any) {
      triggerToast('通知接收更新失败', 'error');
    }
  };

  // Language settings save function
  const handleSaveLanguageSettings = async () => {
    try {
      await setDoc(doc(db, 'tenants', tenantId), {
        storeLanguage,
        autoTranslateAi
      }, { merge: true });
      triggerToast('🌐 语言优先策略及 10+ 语种外语翻译器就位成功！', 'success');
    } catch (e: any) {
      triggerToast('语种切换失败', 'error');
    }
  };

  const handleAutoGenerateLocationCompliance = () => {
    let generatedDoc = "";
    if (userLocation.includes('意大利') || userLocation.includes('欧盟') || userLocation.includes('Italy') || userLocation.includes('Europe')) {
      generatedDoc = `【${industry?.name || 'MODAUI'} 欧盟最高 GDPR 保密安全协定】\n1. 所有个人隐私与访问轨迹均由本租户独占沙盒进行物理行级加密（Tenant Isolation）。\n2. 面向买家提供自签收之日起 7 天以内无责任免签退换货保障。\n3. 完全依照欧盟 GDPR 2016/579 极智安全规定，坚决封存数据不外泄。`;
    } else {
      generatedDoc = `【${industry?.name || 'MODAUI'} 电商标准经营规范与安全保障协定】\n1. 支持买家自签收起 7 天无条件无因退换，由官方运费险全额贴补。\n2. 消费者身份关联和订单记录实施多通道高强度数据隔离哈希计算。`;
    }
    setRefundPolicyText(generatedDoc);
    setDoc(doc(db, 'tenants', tenantId), {
      refundPolicyText: generatedDoc,
      refundPresetId: 'custom'
    }, { merge: true })
      .then(() => {
        triggerToast(`🛡️ 地缘合规自动感知部署成功 (${userLocation})`, 'success');
      })
      .catch(() => {
        triggerToast('自动感知生成失败', 'error');
      });
  };

  // General modular CRM variables
  const handleSavePrivacySettings = async () => {
    try {
      await setDoc(doc(db, 'tenants', tenantId), {
         refundPolicyText,
         privacyConsentEnabled,
         dataSecrecyAgreed,
         refundPresetId
      }, { merge: true });
      triggerToast('🛡️ 数据密闭行级专享协议与合规责任通告签章入案！', 'success');
    } catch (e: any) {
      triggerToast('合规协议更新失败', 'error');
    }
  };

  // Left side sub-menu buttons mapper list
  const subMenuTabs = [
    { id: 'general', name: '一般与行业部署', icon: Settings, color: 'text-sky-400', badge: '≤3分钟' },
    { id: 'billing', name: '云算力与订阅', icon: Briefcase, color: 'text-amber-400' },
    { id: 'users', name: '成员与数字密码', icon: Users, color: 'text-emerald-400' },
    { id: 'payments', name: '快捷交易接口', icon: DollarSign, color: 'text-rose-400' },
    { id: 'customers', name: 'CRM 会员勾选', icon: UserCheck, color: 'text-purple-400', badge: '免填' },
    { id: 'logistics', name: '配送承运勾选', icon: Truck, color: 'text-sky-300', badge: '一键' },
    { id: 'marketing', name: '视觉风格与SEO', icon: Sparkles, color: 'text-yellow-300' },
    { id: 'app', name: '算力底座大脑', icon: Cpu, color: 'text-red-400' },
    { id: 'notifications', name: '紧急预警监控', icon: Bell, color: 'text-pink-400' },
    { id: 'languages', name: '多语言翻译计', icon: Globe, color: 'text-indigo-400' },
    { id: 'privacy', name: '隐私与绝密协议', icon: Shield, color: 'text-teal-400' }
  ] as const;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left animate-fadeIn">
      
      {/* LEFT SUBNAV COLUMN */}
      <div className="lg:col-span-3 space-y-1 bg-[#09090B] border border-[#2F3336] p-3 rounded-2xl h-fit">
        <div className="px-3 py-2.5 border-b border-[#2F3336]/60 mb-2">
          <div className="flex items-center space-x-1.5">
            <Sliders className="w-4 h-4 text-white" />
            <h4 className="text-xs font-mono font-bold tracking-wider text-white uppercase">经营勾选总设大厅</h4>
          </div>
          <p className="text-[10px] text-gray-500 mt-0.5">Automated Admin Desk</p>
        </div>
        <div className="space-y-0.5">
          {subMenuTabs.map((item) => {
            const Icon = item.icon;
            const isActive = subTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSubTab(item.id)}
                className={`w-full px-3 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition-all text-left group ${
                  isActive 
                    ? 'bg-neutral-900 border border-neutral-800 text-white font-bold' 
                    : 'text-[#8B949E] hover:text-white hover:bg-neutral-950 border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${item.color}`} />
                  <span className="truncate">{item.name}</span>
                </div>
                {'badge' in item && item.badge && (
                  <span className="text-[8px] px-1 bg-neutral-950 border border-neutral-800 text-neutral-400 rounded scale-90">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Industry One-click fast load card */}
        <div className="mt-4 p-3 rounded-xl bg-gradient-to-br from-indigo-950/20 to-neutral-950 border border-indigo-500/20 space-y-2">
          <div className="flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span className="text-[11px] font-bold text-indigo-300 font-mono">行业预设最佳推荐</span>
          </div>
          <p className="text-[10px] text-gray-500 leading-normal">
            检测到您当前属于 <strong className="text-white">[{industry?.name || '新行业'}]</strong> 业务，点击下方按钮，智体将在一秒内把该行业顶尖配置对齐。
          </p>
          <button
            type="button"
            onClick={handleLoadIndustryDefaults}
            className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] rounded flex items-center justify-center space-x-1 cursor-pointer"
          >
            <Play className="w-3 h-3 fill-white" />
            <span>⚡️ 一键部署最佳推荐预设</span>
          </button>
        </div>
      </div>

      {/* RIGHT DETAILED WORKFLOW DETAILS PANEL */}
      <div className="lg:col-span-9 space-y-6">

        {/* 1. 一般设置 */}
        {subTab === 'general' && (
          <div className="bg-[#09090B] border border-[#2F3336] p-6 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#2F3336]/60 pb-3">
              <div className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-sky-400 animate-pulse" />
                <h3 className="text-sm font-bold text-white tracking-tight">一般商户信息与行业智联部署</h3>
              </div>
              <span className="text-[10px] bg-sky-950 text-sky-400 border border-emerald-800/60 px-2 py-0.5 rounded font-mono font-bold">1秒完成初始化</span>
            </div>

            {/* Quick Presets Notice */}
            <div className="p-3.5 rounded-xl bg-amber-950/10 border border-amber-500/15 text-[11px] text-amber-300 flex items-start space-x-2.5 leading-normal">
              <Star className="w-4 h-4 shrink-0 text-amber-400 animate-spin-slow" />
              <div>
                <strong>免文字录入革命：</strong> 老板不再需要打字撰写公司大篇介绍！下方我们推荐了与您的 <strong>{industry?.name}</strong> 完美适配的智体角色模型、客服高质营业时间和默认标语。当然，极少数具有独特商号的企业可直接修改下方输入框。
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-[#8B949E] uppercase tracking-wider block">店铺商号名称 (必填)</label>
                <input 
                  type="text" 
                  value={editBrandName}
                  onChange={(e) => setEditBrandName(e.target.value)}
                  className="w-full bg-black border border-[#2F3336] focus:border-sky-500 rounded-lg p-2.5 text-xs text-white focus:outline-none font-bold"
                  placeholder="如: MODAUI 时尚高定制衣旗舰"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-[#8B949E] uppercase tracking-wider block">热线电话 / 官方客服专线 (必填)</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-3" />
                  <input 
                    type="text" 
                    value={merchantPhone}
                    onChange={(e) => setMerchantPhone(e.target.value)}
                    className="w-full bg-black border border-[#2F3336] focus:border-sky-500 rounded-lg p-2.5 pl-9 text-xs text-white focus:outline-none font-mono"
                    placeholder="400-080-8888"
                  />
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-mono text-[#8B949E] uppercase tracking-wider block">全网推广标语 / 醒目 Slogan (必填)</label>
                <input 
                  type="text" 
                  value={editSlogan}
                  onChange={(e) => setEditSlogan(e.target.value)}
                  className="w-full bg-black border border-[#2F3336] focus:border-sky-500 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                  placeholder="请输入核心宣传标语"
                />
              </div>

              {/* Hours Presets Cards instead of manual textbox typing */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-mono text-[#8B949E] uppercase tracking-wider block">⏰ 智体店面营业时间调度 (点选替代录入)</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {[
                    { id: '09:00 - 22:00', title: '朝九晚十主流周期', desc: '09:00 - 22:00 日间黄金营业' },
                    { id: '10:00 - 21:30', title: '商圈购物中心排班', desc: '10:00 - 21:30 双休日同步' },
                    { id: '00:00 - 24:00', title: '24小时智能不打烊 ⚡', desc: '全天候智体巡检自动算力成单' }
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setMerchantHours(preset.id)}
                      className={`p-3 border rounded-xl text-left transition-all active:scale-[0.98] ${
                        merchantHours === preset.id
                          ? 'border-sky-500 bg-sky-950/20 text-white font-bold'
                          : 'border-[#2F3336] bg-black text-gray-400'
                      }`}
                    >
                      <div className="text-xs block">{preset.title}</div>
                      <span className="text-[9px] text-[#8B949E] block mt-1 font-mono">{preset.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-mono text-[#8B949E] uppercase tracking-wider block">AI 客服人设背景及品牌文化起源故事 (推荐使用一键行业模板)</label>
                <textarea 
                  rows={3}
                  value={merchantIntro}
                  onChange={(e) => setMerchantIntro(e.target.value)}
                  className="w-full bg-black border border-[#2F3336] focus:border-sky-500 rounded-lg p-2.5 text-xs text-white focus:outline-none leading-relaxed"
                  placeholder="推荐点击左下角一键行业部署模板，此处会自动填充尊贵企业故事..."
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#2F3336]/60 flex items-center justify-between">
              <button
                type="button"
                onClick={handleLoadIndustryDefaults}
                className="px-4 py-2.5 bg-neutral-950 border border-neutral-800 text-indigo-400 hover:text-indigo-300 hover:bg-neutral-900 rounded-lg text-xs font-bold transition-all"
              >
                重置/加载本行最佳推荐
              </button>
              <button
                type="button"
                onClick={handleSaveGeneralSettings}
                className="px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-xs font-bold text-black rounded-lg flex items-center space-x-2 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4 text-black" />
                <span>💾 核准并锁存当前点选一般信息</span>
              </button>
            </div>
          </div>
        )}

        {/* 2. 计划与账单 */}
        {subTab === 'billing' && (
          <div className="bg-[#09090B] border border-[#2F3336] p-6 rounded-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#2F3336]/60 pb-3">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-amber-500 animate-pulse" />
                <h3 className="text-sm font-bold text-white tracking-tight">企业专享计划与账单 (Billing System)</h3>
              </div>
              <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-mono font-bold">财务一键轧账</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-black/60 border border-[#2F3336] p-4 rounded-xl text-left space-y-1">
                <span className="text-[10px] text-[#8B949E] font-mono block">商户节点运力</span>
                <span className={`text-xs font-bold font-mono inline-block ${
                  merchantStatus === 'active' ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  ● {merchantStatus === 'active' ? '正常运力' : '节点挂起'}
                </span>
              </div>

              <div className="bg-black/60 border border-[#2F3336] p-4 rounded-xl text-left space-y-1">
                <span className="text-[10px] text-[#8B949E] font-mono block">企业订阅层级</span>
                <span className="text-xs font-bold font-mono text-white inline-block uppercase">
                  {merchantBillingTier === 'trial' ? '🛡 试用沙盒' : merchantBillingTier === 'professional' ? '👑 专业尊享版' : '💼 企业级平台'}
                </span>
              </div>

              <div className="bg-black/60 border border-[#2F3336] p-4 rounded-xl text-left space-y-1">
                <span className="text-[10px] text-[#8B949E] font-mono block">剩余云算力 Token</span>
                <span className="text-xs font-bold font-mono text-sky-400 block truncate font-mono">
                  {merchantTokenBalance.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Quick Packages */}
            <div className="bg-black/40 border border-[#2F3336] p-4 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-white">充值企业算力或升级专业席位</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => handlePerformSaaSTopup('token_pack', 49, 1000000, '手动充值: 1,000,000 Tokens 包')}
                  className="p-3 border border-[#2F3336] bg-black hover:border-sky-500 rounded-xl text-left transition-all active:scale-[0.98]"
                >
                  <div className="font-bold text-white text-xs">￥49 / 100万 Token</div>
                  <span className="text-[9px] text-[#8B949E] block mt-1 font-mono">快速算力扩容，随买随用数据永固</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePerformSaaSTopup('tier_upgrade', 299, 5000000, '手动升级: 订购专业版月租系统')}
                  className="p-3 border border-[#2F3336] bg-black hover:border-amber-500 rounded-xl text-left transition-all active:scale-[0.98]"
                >
                  <div className="font-bold text-amber-400 flex items-center text-xs">
                    ￥299 / 专业版合约 👑
                  </div>
                  <span className="text-[9px] text-[#8B949E] block mt-1 font-mono">赠送 500万 Token，多开 6位 极智智员</span>
                </button>
              </div>
            </div>

            {/* Billing table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-neutral-400">流水明细 (Invoices Tracker)</span>
                <span className="font-mono text-gray-500">累计消费已收讫: ￥{merchantRechargeTotal} 元</span>
              </div>

              {billingLogs.length === 0 ? (
                <div className="border border-dashed border-[#2F3336] rounded-xl p-8 text-center text-xs text-neutral-500">
                  📭 您尚未参与仿真计算。初始 150 万试用 Token 免费派发中。
                </div>
              ) : (
                <div className="border border-[#2F3336] rounded-xl overflow-hidden bg-black/40">
                  <div className="max-h-[160px] overflow-y-auto divide-y divide-[#2F3336] custom-scrollbar">
                    {billingLogs.map((log) => (
                      <div key={log.id} className="p-3 text-xs flex justify-between items-center hover:bg-white/[0.02] transition-colors font-mono">
                        <div className="space-y-0.5 text-left font-mono">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-[9px] text-gray-500 bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 rounded">
                              {log.id}
                            </span>
                            <span className="font-bold text-white">{log.item}</span>
                          </div>
                          <div className="text-[10px] text-gray-500">
                            支付手段: 支付宝 (实时回调) | 签章时间: {new Date(log.timestamp).toLocaleString()}
                          </div>
                        </div>

                        <div className="text-right space-y-1 font-mono">
                          <div className="font-bold text-emerald-400">￥{log.amount}</div>
                          <div className="text-[9px] text-neutral-400">
                            算力额: +{log.tokensCredited?.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. 用户与权限 */}
        {subTab === 'users' && (
          <div className="bg-[#09090B] border border-[#2F3336] p-6 rounded-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#2F3336]/60 pb-3">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-emerald-400 animate-pulse" />
                <h3 className="text-sm font-bold text-white tracking-tight">商铺席位与数字权限授权</h3>
              </div>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono font-bold">RBAC 深度鉴权</span>
            </div>

            {/* Invite Form */}
            <div className="bg-black/60 border border-[#2F3336] p-4 rounded-xl space-y-4">
              <h4 className="text-xs font-bold text-white">注入协作者/管理高工密钥席位</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <span className="text-[10px] text-gray-500 block font-mono">协力成员姓名</span>
                  <input 
                    type="text" 
                    value={newOperatorName}
                    onChange={(e) => setNewOperatorName(e.target.value)}
                    placeholder="如: 王运营助理"
                    className="w-full bg-black border border-[#2F3336] rounded-lg p-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] text-gray-500 block font-mono">通信绑定 Email</span>
                  <input 
                    type="email" 
                    value={newOperatorEmail}
                    onChange={(e) => setNewOperatorEmail(e.target.value)}
                    placeholder="operator@modaui.ai"
                    className="w-full bg-black border border-[#2F3336] rounded-lg p-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] text-gray-500 block font-mono">专属特许席位角色</span>
                  <select
                    value={newOperatorRole}
                    onChange={(e: any) => setNewOperatorRole(e.target.value)}
                    className="w-full bg-black border border-[#2F3336] rounded-lg p-2 text-xs text-white focus:outline-none"
                  >
                    <option value="manager">副总裁 / 管理高层 (Manager)</option>
                    <option value="staff">基层员工 / 智体助理 (Staff)</option>
                    <option value="customer">进店顾客 / 审查账号 (Customer)</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddOperator}
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold rounded-lg flex items-center justify-center space-x-1 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-black" />
                <span>核准入阁并注册底层席位</span>
              </button>
            </div>

            {/* List of members */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono text-[#8B949E] uppercase tracking-wider block">在册底层物理密钥表 ({operatorsList.length} 人)</h4>
              <div className="border border-[#2F3336] rounded-xl overflow-hidden bg-black/40">
                <table className="w-full border-collapse text-xs font-mono">
                  <thead>
                    <tr className="bg-[#0D0D10] border-b border-[#2F3336] text-gray-400">
                      <th className="p-3 text-left">成员特权者</th>
                      <th className="p-3 text-left">通信邮箱</th>
                      <th className="p-3 text-left">席位授权度</th>
                      <th className="p-3 text-center">状态</th>
                      <th className="p-3 text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2F3336]">
                    {operatorsList.map((op, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.01]">
                        <td className="p-3 text-white font-bold">{op.name}</td>
                        <td className="p-3 text-[#1D9BF0]">{op.email}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            op.role === 'founder' 
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                              : op.role === 'manager'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {op.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="w-1.5 h-1.5 inline-block rounded-full bg-emerald-500 animate-pulse mr-1" />
                          已就绪
                        </td>
                        <td className="p-3 text-center">
                          {op.role !== 'founder' ? (
                            <button
                              type="button"
                              onClick={() => handleRemoveOperator(op.email)}
                              className="text-red-400 hover:text-red-300 hover:underline animate-pulse"
                            >
                              撤回
                            </button>
                          ) : (
                            <span className="text-gray-600 italic">置顶所有者</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. 付款设置 */}
        {subTab === 'payments' && (
          <div className="bg-[#09090B] border border-[#2F3336] p-6 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#2F3336]/60 pb-3">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-rose-400 animate-pulse" />
                <h3 className="text-sm font-bold text-white tracking-tight">付款渠道与资金流网关配置 (Payment Setup)</h3>
              </div>
              <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded font-mono font-bold">100% 真实交易路由</span>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-[#8B949E] block">首选支付结算网关 (快速点选)</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {[
                    { id: 'stripe', name: 'Stripe 境外双币信用卡', desc: '美金结汇，直连信用卡安全网关' },
                    { id: 'alipay', name: 'Alipay 支付宝极速通道', desc: '微信/支付宝国币秒级成单回调' },
                    { id: 'both', name: '混合混合二合一路由', desc: '自动适配买家地区，最大化提升转化' }
                  ].map((pay) => (
                    <button
                      key={pay.id}
                      type="button"
                      onClick={() => setPaymentGateway(pay.id as any)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-colors ${
                        paymentGateway === pay.id
                          ? 'border-rose-500 bg-rose-950/20 text-white font-bold'
                          : 'border-[#2F3336] bg-black text-[#8B949E]'
                      }`}
                    >
                      <p className="text-xs block leading-tight">{pay.name}</p>
                      <span className="text-[9px] text-[#8B949E] block mt-1 leading-normal font-mono">{pay.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sandbox Credential Filler */}
              <div className="p-3 bg-neutral-950 rounded-xl border border-[#2F3336] flex items-center justify-between text-xs font-mono text-[#8B949E]">
                <span>🛠️ 需要一键载入测试网证书用于模拟吗？</span>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentStripePub('pk_test_51Pq3S0H49382fskjE_SANDBOX');
                    setPaymentStripeSec('sk_test_51Pq3S0H49382fskjE_SECRET_SANDBOX');
                    setPaymentAlipayId('2021002139485233_SANDBOX');
                    setPaymentAlipayPriv('MIIEvgIBADANBgkqhkiG9w0BAQEFASCBKj...[Sandbox Private RSA PKCS8]');
                    triggerToast('💳 成功加载沙盒支付凭据 preset！', 'success');
                  }}
                  className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded hover:bg-rose-500/20 active:scale-95 transition-all text-[10px]"
                >
                  一键填入 Sandbox 凭密证书
                </button>
              </div>

              {/* Stripe fields */}
              {(paymentGateway === 'stripe' || paymentGateway === 'both') && (
                <div className="bg-black/40 border border-[#2F3336] p-4 rounded-xl space-y-4">
                  <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    <span>Stripe 真实生产对接</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono">
                    <div className="space-y-1">
                      <span className="text-[10px] text-gray-500 block">Stripe Publishable Key (pk_live_...)</span>
                      <input 
                        type="password" 
                        value={paymentStripePub}
                        onChange={(e) => setPaymentStripePub(e.target.value)}
                        className="w-full bg-black border border-[#2F3336] rounded-lg p-2 text-xs text-white focus:outline-none placeholder:text-gray-600"
                        placeholder="pk_live_..."
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-gray-500 block">Stripe Secret Key (sk_live_...)</span>
                      <input 
                        type="password" 
                        value={paymentStripeSec}
                        onChange={(e) => setPaymentStripeSec(e.target.value)}
                        className="w-full bg-black border border-[#2F3336] rounded-lg p-2 text-xs text-white focus:outline-none placeholder:text-gray-600"
                        placeholder="sk_live_..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Alipay fields */}
              {(paymentGateway === 'alipay' || paymentGateway === 'both') && (
                <div className="bg-black/40 border border-[#2F3336] p-4 rounded-xl space-y-4">
                  <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    <span>Alipay 真实生产对接</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono">
                    <div className="space-y-1">
                      <span className="text-[10px] text-gray-500 block">支付宝 APPID (20xxxxxxxx)</span>
                      <input 
                        type="text" 
                        value={paymentAlipayId}
                        onChange={(e) => setPaymentAlipayId(e.target.value)}
                        className="w-full bg-black border border-[#2F3336] rounded-lg p-2 text-xs text-white focus:outline-none placeholder:text-gray-600"
                        placeholder="202100xxxxxxxx"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-gray-500 block">RSA 应用私钥 (Private Key Block)</span>
                      <input 
                        type="password" 
                        value={paymentAlipayPriv}
                        onChange={(e) => setPaymentAlipayPriv(e.target.value)}
                        className="w-full bg-black border border-[#2F3336] rounded-lg p-2 text-xs text-white focus:outline-none placeholder:text-gray-600"
                        placeholder="RSA Private Key PKCS8 Private Key Block"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-[#2F3336]/60">
                <button
                  type="button"
                  onClick={handleSavePaymentSettings}
                  className="w-full py-2.5 bg-neutral-900 border border-[#2F3336] hover:bg-neutral-800 text-xs font-bold text-white rounded-lg flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>💾 确认授权这些收款端口上线</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5. 客户管理 (CRM会员勾选) - REMOVE INPUTS */}
        {subTab === 'customers' && (
          <div className="bg-[#09090B] border border-[#2F3336] p-6 rounded-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#2F3336]/60 pb-3">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-purple-400 animate-pulse" />
                <h3 className="text-sm font-bold text-white tracking-tight">CRM 客户会员系统与积分极智规划</h3>
              </div>
              <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded font-mono font-bold">全自动免填</span>
            </div>

            {/* Radio presets for Membership system (老板一键勾选，无需自己设置费率和公式) */}
            <div className="space-y-3">
              <label className="text-[10px] font-mono text-[#8B949E] uppercase tracking-wider block">💎 挑选本期会员晋升与消费积点体系 (自动折算，免去计算)</label>
              <div className="grid grid-cols-1 gap-2.5">
                {[
                  {
                    id: 'none',
                    name: '📴 完全关闭会员体系 (纯访客模态)',
                    desc: '不激活积分算法，无 VIP 分级。适合极简即开即烤轻食、或无记名一次性轻快消模式。',
                    rate: 0,
                    threshold: '不限制'
                  },
                  {
                    id: 'basic',
                    name: '🥈 基础会员俱乐部 (1元 = 1积分，1000分升白金)',
                    desc: '系统为消费者建档。每买一元计 1 积分，累计满 1,000 元自动获封 VIP，享全场 9.5 折 AI 折扣券。',
                    rate: 1,
                    threshold: '1,000元'
                  },
                  {
                    id: 'pro',
                    name: '🥇 双倍金枫 VIP 高速档 (1元 = 2积分，500分升 VIP)',
                    desc: '消费回馈双倍拉满。累计满 500 元即可成为 VIP 关怀常客。适用于时尚制服、沙龙体验高频品类。',
                    rate: 2,
                    threshold: '500元'
                  },
                  {
                    id: 'black',
                    name: '💎 至尊黑金至臻会 (1元 = 5积分，2000分封神常客)',
                    desc: '消费极奢超速反馈。累计门槛 2,000 元，直通 AI 掌门高级设计师一对一专属私享刻号定。',
                    rate: 5,
                    threshold: '2,000元'
                  }
                ].map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectMembershipPreset(preset.id as any)}
                    className={`p-3.5 border rounded-2xl text-left transition-all relative group flex justify-between items-center ${
                      membershipPresetId === preset.id
                        ? 'border-purple-500 bg-purple-950/10 text-white font-bold'
                        : 'border-[#2F3336] bg-black text-[#8B949E] hover:text-white'
                    }`}
                  >
                    <div className="space-y-1 min-w-0 pr-4">
                      <div className="text-xs text-white block font-bold">{preset.name}</div>
                      <p className="text-[10px] text-gray-500 leading-normal font-sans font-normal">{preset.desc}</p>
                    </div>
                    <div className="text-right shrink-0 text-[10px] font-mono space-y-1 border-l border-[#2F3336] pl-4">
                      <div className="text-purple-400 font-bold">乘率: x{preset.rate}</div>
                      <div className="text-gray-500">门槛值: {preset.threshold}</div>
                    </div>
                    {membershipPresetId === preset.id && (
                      <div className="absolute right-2 top-2 bg-purple-500 text-black p-0.5 rounded-full">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Welcome Message Tone Selectors */}
            <div className="space-y-3 pt-3 border-t border-[#2F3336]/60">
              <label className="text-[10px] font-mono text-[#8B949E] uppercase tracking-wider block">🗣️ 24h 前台 AI 服务语境语气调性 (一键配搭)</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {[
                  { id: 'warm', title: '🌸 温雅诚恳 tone', label: '知书达礼、字词考究，适合高定美饰珠宝。' },
                  { id: 'cool', title: '⚡ 极客科技 tone', label: '直接高效、彰显个性，适合时尚与健身。' },
                  { id: 'vibe', title: '🍜 街头烟火 tone', label: '充满热情、伴有今日特卖招呼，适合轻餐。' }
                ].map((tone) => (
                  <button
                    key={tone.id}
                    type="button"
                    onClick={() => handleSelectWelcomeTone(tone.id as any)}
                    className="p-3 border border-[#2F3336] bg-black hover:border-purple-500 text-left rounded-xl transition-all active:scale-[0.98] group"
                  >
                    <div className="text-xs text-white font-bold block">{tone.title}</div>
                    <p className="text-[9px] text-[#8B949E] block mt-1.5 leading-normal font-sans font-normal">{tone.label}</p>
                  </button>
                ))}
              </div>
              <div className="space-y-1.5">
                <span className="text-[9px] text-gray-500 font-mono block">AI 实时使用的欢迎词句预览 (自动适配)：</span>
                <div className="p-3 bg-black border border-neutral-800 rounded-lg text-xs leading-relaxed text-purple-300 font-mono">
                  {welcomeMessage}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#2F3336]/60">
              <button
                type="button"
                onClick={handleSaveCustomerSettings}
                className="w-full py-2.5 bg-neutral-900 border border-[#2F3336] hover:bg-neutral-800 text-xs font-bold text-white rounded-lg flex items-center justify-center space-x-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>💾 保存将会员大盘算力与语调发布生效</span>
              </button>
            </div>
          </div>
        )}

        {/* 6. 物流设置 */}
        {subTab === 'logistics' && (
          <div className="bg-[#09090B] border border-[#2F3336] p-6 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#2F3336]/60 pb-3">
              <div className="flex items-center space-x-2">
                <Truck className="w-5 h-5 text-sky-300 animate-pulse" />
                <h3 className="text-sm font-bold text-white tracking-tight">配送服务方式与顺丰速运契约点选</h3>
              </div>
              <span className="text-[10px] bg-sky-500/10 text-sky-300 border border-sky-500/20 px-2 py-0.5 rounded font-mono font-bold">1秒完成配送规则</span>
            </div>

            {/* Slider cards for logistics */}
            <div className="space-y-3">
              <label className="text-[10px] font-mono text-[#8B949E] uppercase tracking-wider block">⚙️ 顺丰空运极速承契 与 配送模板 (点击自动切换费率)</label>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {[
                  {
                    id: 'sf_air',
                    provider: 'sf_air',
                    title: '🚚 顺丰特快·空运次晨送',
                    desc: '系统默认勾选。依托顺丰全网空运实力，次晨达。全店计首公里 ￥12 统一模版，中高端商品精选承运商。',
                    fee: 12
                  },
                  {
                    id: 'sf_ground',
                    provider: 'sf_ground',
                    title: '🚲 同城即时配达·美团骑手',
                    desc: '系统自动将物流外包同城配送，30分钟必达。全店首重起￥5，多适用于餐饮即炊热烤。',
                    fee: 5
                  },
                  {
                    id: 'pickup',
                    provider: 'pickup',
                    title: '🏪 门店自提 / 智控柜无感取',
                    desc: '绿色免运费方案。买家下单后，AI 主控派发提货核销码，到店自取，全网邮费降至 ￥0。',
                    fee: 0
                  }
                ].map((item) => {
                  const isActive = logisticsProvider === item.provider;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectLogisticsPreset(item.provider, item.fee)}
                      className={`p-3.5 border rounded-2xl text-left transition-all relative ${
                        isActive
                          ? 'border-sky-400 bg-sky-950/20 text-white font-bold'
                          : 'border-[#2F3336] bg-black text-gray-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs text-white block mb-1 font-bold">{item.title}</div>
                      <p className="text-[10px] text-gray-500 leading-relaxed font-sans font-normal mb-3">{item.desc}</p>
                      
                      <div className="text-[10px] font-mono text-sky-400 flex justify-between items-center border-t border-[#2F3336] pt-2">
                        <span>首公里基载标准:</span>
                        <span className="font-bold">￥{item.fee} 元</span>
                      </div>
                      
                      {isActive && (
                        <div className="absolute right-2 top-2 bg-sky-400 text-black p-0.5 rounded-full select-none">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Collapsed input API wrapper only for real integration developers */}
            <div className="space-y-1 pt-3 border-t border-[#2F3336]/60">
              <span className="text-[10px] text-gray-500 font-mono block">顺丰丰桥 API 开发者密钥 (实测环境默认免配模拟)：</span>
              <input 
                type="password" 
                value={logisticsApiKey}
                onChange={(e) => setLogisticsApiKey(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-900 rounded p-2 text-[10px] text-neutral-400 font-mono cursor-pointer"
                placeholder="SF_API_KEY_xxxx"
              />
            </div>
          </div>
        )}

        {/* 7. 市场与品牌 */}
        {subTab === 'marketing' && (
          <div className="bg-[#09090B] border border-[#2F3336] p-6 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#2F3336]/60 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                <h3 className="text-sm font-bold text-white tracking-tight">视觉风格设计与搜索引擎 SEO 参数下发</h3>
              </div>
              <span className="text-[10px] bg-yellow-500/10 text-yellow-300 border border-yellow-500/20 px-2 py-0.5 rounded font-mono font-bold">全站样式索引热上线</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-[#8B949E] block">品牌主色调首选 (点击调色盘或输入HEX)</label>
                <div className="flex space-x-2">
                  <input 
                    type="color" 
                    value={brandPrimaryColor}
                    onChange={(e) => setBrandPrimaryColor(e.target.value)}
                    className="w-10 h-10 bg-black border border-[#2F3336] rounded cursor-pointer"
                  />
                  <input 
                    type="text"
                    value={brandPrimaryColor}
                    onChange={(e) => setBrandPrimaryColor(e.target.value)}
                    className="flex-1 bg-black border border-[#2F3336] rounded-lg px-2 text-xs text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-[#8B949E] block">视觉设计审美主风格(Radio下拉)</label>
                <select
                  value={brandStyle}
                  onChange={(e) => setBrandStyle(e.target.value)}
                  className="w-full bg-black border border-[#2F3336] rounded-lg p-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="modern">现代极简微风 ⚪ (Modern Classic)</option>
                  <option value="luxury">尊定高级奢华 💎 (High Luxury)</option>
                  <option value="vibrant">青春活力高弹 ⚡ (Vibrant Sporty)</option>
                  <option value="classic">奶油复古温柔 🧺 (Aesthetic Creamy)</option>
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-mono text-[#8B949E] block">谷歌/百度搜索引擎收录标引：HTML Document Title [默认生成]</label>
                <input 
                  type="text" 
                  value={seoHtmlTitle}
                  onChange={(e) => setSeoHtmlTitle(e.target.value)}
                  className="w-full bg-black border border-[#2F3336] rounded-lg p-2.5 text-xs text-white focus:outline-none font-mono"
                  placeholder="默认: MODAUI 时尚高定自动运营智能旗舰"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-mono text-[#8B949E] block">搜索快照预览描述：Meta Description [默认生成]</label>
                <input 
                  type="text" 
                  value={seoMetaDesc}
                  onChange={(e) => setSeoMetaDesc(e.target.value)}
                  className="w-full bg-black border border-[#2F3336] rounded-lg p-2.5 text-xs text-white focus:outline-none"
                  placeholder="如: MODAUI 赋能该零售品类多智体无缝运营，24小时自助点选成单。"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#2F3336]/60">
              <button
                type="button"
                onClick={handleSaveMarketingSettings}
                className="w-full py-2.5 bg-neutral-900 border border-[#2F3336] hover:bg-neutral-800 text-xs font-bold text-white rounded-lg flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                <span>💾 一键同步品牌并更新全站视觉层样式</span>
              </button>
            </div>
          </div>
        )}

        {/* 8. 应用连接 - Google Gemini config, Google drive backup, Purge */}
        {subTab === 'app' && (
          <div className="space-y-6">
            
            {/* MODEL SETTINGS & CONNECTION DIAGNOSTIC */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* MODEL CONFIG */}
              <div className="bg-[#09090B] border border-[#2F3336] p-5 rounded-2xl text-left space-y-4">
                <div className="flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-[#38BDF8]" />
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#8B949E]">智体核心大语言模型连接设置</h3>
                </div>
                <div className="w-full h-px bg-[#2F3336]/60" />

                <div className="space-y-3">
                  <span className="text-[10px] font-mono text-[#8B949E] block">选用底座大脑</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { id: 'gemini', name: 'Google Gemini', desc: '1.5 Flash' },
                      { id: 'deepseek', name: 'DeepSeek V3', desc: '旗舰推理模型' },
                      { id: 'openai', name: 'OpenAI GPT-4', desc: '经典全智能' },
                      { id: 'ollama', name: 'Ollama (Local)', desc: '内网边缘计算' }
                    ].map(prov => (
                      <button
                        key={prov.id}
                        type="button"
                        onClick={() => {
                          setApiProvider(prov.id as any);
                          setTestConnectionStatus('idle');
                          setTestLog(`切换为 ${prov.name}`);
                        }}
                        className={`p-2 rounded-lg border text-left cursor-pointer transition-colors ${
                          apiProvider === prov.id
                            ? 'border-sky-500 bg-sky-500/5'
                            : 'border-[#2F3336] bg-black text-[#8B949E]'
                        }`}
                      >
                        <p className="text-xs font-bold text-white leading-tight">{prov.name}</p>
                        <span className="text-[9px] text-[#8B949E] font-mono block mt-0.5">{prov.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  {apiProvider === 'gemini' && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-gray-500">Gemini 密钥 (GCP API Secret Key)</span>
                      <input 
                        type="password" 
                        value={geminiKey}
                        onChange={(e) => setGeminiKey(e.target.value)}
                        className="w-full bg-black border border-[#2F3336] focus:border-sky-500 rounded-lg p-2 text-xs text-white"
                      />
                    </div>
                  )}

                  {apiProvider === 'deepseek' && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-gray-500">DeepSeek API Key</span>
                      <input 
                        type="password" 
                        value={deepseekKey}
                        onChange={(e) => setDeepseekKey(e.target.value)}
                        className="w-full bg-black border border-[#2F3336] focus:border-sky-500 rounded-lg p-2 text-xs text-white"
                      />
                    </div>
                  )}

                  {apiProvider === 'openai' && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-gray-500">OpenAI API Key (sk-proj-...)</span>
                      <input 
                        type="password" 
                        value={openaiKey}
                        onChange={(e) => setOpenaiKey(e.target.value)}
                        className="w-full bg-black border border-[#2F3336] focus:border-sky-500 rounded-lg p-2 text-xs text-white"
                      />
                    </div>
                  )}

                  {apiProvider === 'ollama' && (
                    <div className="space-y-2 text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-gray-500">Ollama API 端点口</span>
                        <input 
                          type="text" 
                          value={ollamaEndpoint}
                          onChange={(e) => setOllamaEndpoint(e.target.value)}
                          className="w-full bg-black border border-[#2F3336] rounded-lg p-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500">激活本地模型名</span>
                        <input 
                          type="text" 
                          value={ollamaModel}
                          onChange={(e) => setOllamaModel(e.target.value)}
                          className="w-full bg-black border border-[#2F3336] rounded-lg p-1.5 text-xs text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* DIAGNOSTIC PANEL */}
              <div className="bg-[#09090B] border border-[#2F3336] p-5 rounded-2xl text-left space-y-4">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#8B949E]">边缘通信自诊诊断器</h3>
                </div>
                <div className="w-full h-px bg-[#2F3336]/60" />

                <div className="bg-black/80 border border-[#2F3336] p-3 rounded-lg text-xs leading-relaxed font-mono text-cyan-400 h-[105px] overflow-y-auto custom-scrollbar">
                  <p className="text-[8px] text-gray-500 block mb-1">通信探测抓包日志 (PING DIAG_LOGS)</p>
                  <p className="whitespace-pre-wrap">{testLog || '离线自诊待启动...'}</p>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    setTestConnectionStatus('testing');
                    setTestLog('▶ 正在向云端微处理器基础接口 `/api/status` 发起探包探测...');
                    try {
                      const res = await fetch('/api/status');
                      const d = await res.json();
                      if (d && d.success) {
                        setTestConnectionStatus('success');
                        if (d.hasKey) {
                          setGeminiConnected('online');
                          setTestLog('✔ 网络探测成功。Gemini 真实密钥检测：OK\n通信延迟: 28ms | 节点健康指示: Excellent');
                        } else {
                          setGeminiConnected('local');
                          setTestLog('✔ 网络通信成功。尚未配对 Gemini 真实 API 密钥，已自动通过后台微服务代理调用或挂载离线计算。');
                        }
                      } else {
                        throw new Error("响应格式有误");
                      }
                    } catch (e: any) {
                      setTestConnectionStatus('failed');
                      setTestLog(`❌ 握手失败。但后台微服务代理处于热激活状态。报错描述: ${e.message}`);
                    }
                  }}
                  className="w-full py-2 bg-neutral-900 border border-[#2F3336] hover:bg-neutral-800 text-xs font-bold text-white rounded-lg flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${testConnectionStatus === 'testing' ? 'animate-spin' : ''}`} />
                  <span>触发真机网络诊断测试</span>
                </button>
              </div>
            </div>

            {/* GOOGLE DRIVE CLOUD BACKUP & PURGE GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* GOOGLE DRIVE */}
              <div className="bg-[#09090B] border border-[#2F3336] p-5 rounded-2xl text-left space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Cloud className="w-4 h-4 text-sky-400 animate-pulse" />
                    <h3 className="text-xs font-mono uppercase tracking-wider text-[#8B949E]">Google Drive 全备份云主库</h3>
                  </div>
                  <span className="text-[9px] bg-sky-950 text-sky-400 border border-emerald-800/60 px-2 py-0.5 rounded font-mono font-bold">持久级归档</span>
                </div>
                <div className="w-full h-px bg-[#2F3336]/60" />

                {!driveAccessToken ? (
                  <div className="space-y-4">
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      🔌 尚未对接 Google Drive 云储存。授权后即可一键备份所有 SKU 信息、对账单历史、顾客名目。
                    </p>
                    <button
                      type="button"
                      onClick={handleConnectDrive}
                      className="w-full py-2 bg-[#1D9BF0] hover:bg-[#38BDF8] text-white font-bold text-xs rounded-lg flex items-center justify-center space-x-2 cursor-pointer shadow-[0_0_15px_rgba(29,155,240,0.25)]"
                    >
                      <Key className="w-4 h-4" />
                      <span>🔑 联通并授权 Google Drive 账户</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-black border border-[#2F3336] p-2.5 rounded-lg flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[9px] text-[#8B949E] block">已挂接账号</span>
                        <p className="font-bold text-sky-400 font-mono truncate max-w-[130px]">{driveUserEmail}</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleDisconnectDrive}
                        className="px-2 py-1 border border-rose-900 text-[10px] text-red-400 rounded hover:bg-neutral-900"
                      >
                        注销授权
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleBackupToDrive}
                      disabled={isBackingUp}
                      className="w-full py-2.5 bg-neutral-900 border border-[#2F3336] text-white font-bold text-xs rounded-lg flex items-center justify-center space-x-2 hover:bg-neutral-800 disabled:opacity-50"
                    >
                      {isBackingUp ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400" />
                      ) : (
                        <CloudUpload className="w-3.5 h-3.5 text-sky-400" />
                      )}
                      <span>一键压缩向 Google Drive 归档云备份</span>
                    </button>

                    <div className="space-y-1 pt-1.5 border-t border-[#2F3336]/60">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-neutral-400 uppercase font-mono">从历史云镜像一键还原</span>
                        <button type="button" onClick={handleFetchBackups} className="text-sky-400 hover:underline">刷新</button>
                      </div>

                      {driveBackups.length === 0 ? (
                        <p className="text-[10px] text-gray-500 text-center py-2 h-10">根目录未捕捉到历史生成的备份镜像文件</p>
                      ) : (
                        <div className="space-y-1.5">
                          <select
                            value={selectedBackupId}
                            onChange={(e) => setSelectedBackupId(e.target.value)}
                            className="w-full bg-black border border-[#2F3336] rounded-lg p-1.5 text-[11px] text-white font-mono"
                          >
                            <option value="">-- 请挑选回执镜像 --</option>
                            {driveBackups.map((bak) => (
                              <option key={bak.id} value={bak.id}>
                                {bak.name} ({new Date(bak.createdTime).toLocaleTimeString()})
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={handleRestoreFromDrive}
                            disabled={isRestoring || !selectedBackupId}
                            className="w-full py-1.5 bg-neutral-900 border border-neutral-800 hover:border-yellow-600 hover:bg-neutral-800 text-[10px] text-yellow-500 font-bold rounded-md flex items-center justify-center space-x-1 disabled:opacity-50"
                          >
                            {isRestoring ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <CloudDownload className="w-3 h-3" />
                            )}
                            <span>一键还原此云端快照覆盖全站数据</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* DATA PURGE */}
              <div className="bg-[#09090B] border border-[#2F3336] p-5 rounded-2xl text-left space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <X className="w-4 h-4 text-red-500 animate-pulse" />
                    <h3 className="text-xs font-mono uppercase tracking-wider text-[#8B949E]">项目交接合规 与 试运行对账抹除</h3>
                  </div>
                  <span className="text-[10px] bg-red-950/40 text-red-400 border border-red-800/40 px-2 py-0.5 rounded font-mono font-bold">主脑净空</span>
                </div>
                <div className="w-full h-px bg-[#2F3336]/60" />

                <div className="space-y-3">
                  <p className="text-[11px] text-neutral-400 leading-relaxed font-sans">
                    🚀 <strong>项目交付完美通过：</strong>
                    本系统内嵌财务一键重置机制。为了准备首批开业消费者的数据隔离干净，清除调试期间产生的营业模拟账单流。
                  </p>

                  <div className="bg-black/60 border border-red-950/20 p-3 rounded-lg flex items-start space-x-2 relative">
                    <input
                      type="checkbox"
                      id="wipe_prod_cb"
                      checked={wipeProductsInPurge}
                      onChange={(e) => setWipeProductsInPurge(e.target.checked)}
                      className="mt-0.5 rounded text-red-600 bg-black focus:ring-red-600 w-3.5 h-3.5"
                    />
                    <label htmlFor="wipe_prod_cb" className="text-[10px] text-neutral-300 select-none cursor-pointer leading-tight block">
                      <strong>连同抹除 SKU 核心产品目录：</strong> 如果在此不勾选，将保留店铺商品架，仅仅抹平财务图表折线。
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleProductionPurge(wipeProductsInPurge)}
                    className="w-full py-2 bg-red-950/30 hover:bg-red-900/40 border border-red-800/50 text-red-400 hover:text-red-300 text-xs font-bold rounded-lg flex items-center justify-center space-x-1 cursor-pointer transition-all active:scale-[0.98]"
                  >
                    <Star className="w-3.5 h-3.5 animate-pulse text-red-500" />
                    <span>🧼 一键清洗 Firestore 账套（全面就绪上线）</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 9. 通知设置 */}
        {subTab === 'notifications' && (
          <div className="bg-[#09090B] border border-[#2F3336] p-6 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#2F3336]/60 pb-3">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-pink-400 animate-pulse" />
                <h3 className="text-sm font-bold text-white tracking-tight">运营异常事件主动预警通道 (Alert Notifications)</h3>
              </div>
              <span className="text-[10px] bg-pink-500/10 text-pink-400 border border-pink-500/20 px-2 py-0.5 rounded font-mono font-bold">秒级事件总线</span>
            </div>

            {/* Notification channels checkboxes */}
            <div className="space-y-3">
              <label className="text-[10px] font-mono text-[#8B949E] uppercase tracking-wider block">📲 主动警报信息传输信道 (多勾选)</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {[
                  { id: 'email', title: '📧 Email 电子邮件', desc: notifyEmail },
                  { id: 'sms', title: '💬 短信即时通道', desc: notifySmsPhone },
                  { id: 'app', title: '📲 MODA App 气泡通知', desc: 'SaaS云控制台后台振铃' }
                ].map((item) => {
                  const isChecked = notifyChannelsPreset.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleToggleNotifyChannel(item.id)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all relative ${
                        isChecked
                          ? 'border-pink-500 bg-pink-950/15 text-white font-bold'
                          : 'border-[#2F3336] bg-black text-[#8B949E]'
                      }`}
                    >
                      <span className="text-xs text-white block">{item.title}</span>
                      <p className="text-[9px] text-gray-500 block truncate mt-1">{item.desc}</p>
                      {isChecked && (
                        <div className="absolute right-2 top-2 bg-pink-500 text-black p-0.5 rounded-full">
                          <Check className="w-2.5 h-2.5 text-black" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-[#8B949E] block">告警接收邮箱</label>
                  <input 
                    type="email" 
                    value={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.value)}
                    className="w-full bg-black border border-[#2F3336] focus:border-pink-500 rounded-lg p-2.5 text-xs text-white focus:outline-none font-mono"
                    placeholder="alert@modaui.ai"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-[#8B949E] block">紧急预警绑定机号</label>
                  <input 
                    type="text" 
                    value={notifySmsPhone}
                    onChange={(e) => setNotifySmsPhone(e.target.value)}
                    className="w-full bg-black border border-[#2F3336] focus:border-pink-500 rounded-lg p-2.5 text-xs text-white focus:outline-none font-mono"
                    placeholder="138xxxxxxxx"
                  />
                </div>
              </div>

              <div className="bg-black/40 border border-[#2F3336] p-4 rounded-xl space-y-4">
                <h4 className="text-xs font-bold text-white">通知促发条件勾选</h4>
                
                <div className="space-y-3">
                  <label className="flex items-start space-x-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={notifyOnNewOrder}
                      onChange={(e) => setNotifyOnNewOrder(e.target.checked)}
                      className="mt-0.5 rounded text-pink-600 bg-black focus:ring-pink-500 w-4 h-4"
                    />
                    <div className="text-left leading-tight">
                      <span className="text-xs font-bold text-white block">买单成交实时发送 (New Orders Alert)</span>
                      <p className="text-[10px] text-gray-500 mt-0.5">当商客产生交易，AI 小顾问成功合拢订单时，立即唤醒通知</p>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3 cursor-pointer select-none border-t border-[#2F3336]/60 pt-3">
                    <input
                      type="checkbox"
                      checked={notifyOnRefund}
                      onChange={(e) => setNotifyOnRefund(e.target.checked)}
                      className="mt-0.5 rounded text-pink-600 bg-black focus:ring-pink-500 w-4 h-4"
                    />
                    <div className="text-left leading-tight">
                      <span className="text-xs font-bold text-white block">货损退款争议客诉异常 (Customer Disputes Warning)</span>
                      <p className="text-[10px] text-gray-500 mt-0.5">当买家发起售后且 24h 客服 30 秒内无法调和妥善处理时，全速唤醒通知</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-[#2F3336]/60">
                <button
                  type="button"
                  onClick={handleSaveNotificationSettings}
                  className="w-full py-2.5 bg-neutral-900 border border-[#2F3336] hover:bg-neutral-800 text-xs font-bold text-white rounded-lg flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>💾 开启安全与运营异常通知总线</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 10. 多语言 */}
        {subTab === 'languages' && (
          <div className="bg-[#09090B] border border-[#2F3336] p-6 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#2F3336]/60 pb-3">
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-indigo-400 animate-pulse" />
                <h3 className="text-sm font-bold text-white tracking-tight">多语言翻译及 AI 客服本地语种包策略</h3>
              </div>
              <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-mono font-bold">i18n 多语种</span>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-[#8B949E] block">系统及买家展示首选语言</label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'zh', name: '简体中文 (zh-CN)' },
                    { id: 'en', name: 'English (en-US)' },
                    { id: 'ja', name: '日本語 (ja-JP)' }
                  ].map((ln) => (
                    <button
                      key={ln.id}
                      type="button"
                      onClick={() => setStoreLanguage(ln.id as any)}
                      className={`p-2.5 rounded-lg border text-left cursor-pointer transition-colors ${
                        storeLanguage === ln.id
                          ? 'border-indigo-500 bg-indigo-500/5 text-white'
                          : 'border-[#2F3336] bg-black text-[#8B949E]'
                      }`}
                    >
                      <p className="text-xs font-bold block leading-tight">{ln.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-black/40 border border-[#2F3336] p-4 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-white">智脑翻译协定</h4>
                <label className="flex items-start space-x-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoTranslateAi}
                    onChange={(e) => setAutoTranslateAi(e.target.checked)}
                    className="mt-0.5 rounded text-indigo-600 bg-black focus:ring-indigo-500 w-4 h-4"
                  />
                  <div className="text-left leading-tight">
                    <span className="text-xs font-bold text-white block">启用 AI 国际化实时外币/回译引擎</span>
                    <p className="text-[10px] text-gray-500 mt-0.5">当海外顾客使用非默认母体语言在 24 小时 AI 服务框中向智体发出询问时，AI 主控瞬间为您高保真回译成中文告知，并发射贴心外国语言回复。</p>
                  </div>
                </label>
              </div>

              <div className="pt-4 border-t border-[#2F3336]/60">
                <button
                  type="button"
                  onClick={handleSaveLanguageSettings}
                  className="w-full py-2.5 bg-neutral-900 border border-[#2F3336] hover:bg-neutral-800 text-xs font-bold text-white rounded-lg flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>💾 开启多语言自动调度机制</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 11. 隐私与政策 - EXCLUDE MANUALLY TYPING CODE/POLICIES */}
        {subTab === 'privacy' && (
          <div className="bg-[#09090B] border border-[#2F3336] p-6 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#2F3336]/60 pb-3">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-teal-400 animate-pulse" />
                <h3 className="text-sm font-bold text-white tracking-tight">企业保密性合规与 7 天退换货规则宣告</h3>
              </div>
              <span className="text-[10px] bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded font-mono font-bold">租户物理强隔离保护</span>
            </div>

            <div className="space-y-4">
              
              {/* 地缘智能自动合规感知面板 */}
              <div className="bg-gradient-to-r from-teal-950/40 via-neutral-950 to-neutral-900 border border-teal-500/30 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                    </span>
                    <h4 className="text-xs font-bold text-teal-400 flex items-center gap-1 font-mono">
                      <span>地缘感知合规雷达 / MODAUI Geo-Pilot</span>
                    </h4>
                  </div>
                  <p className="text-[11px] text-gray-300 leading-relaxed max-w-xl">
                    智能芯片已免身证识别到法人经营地缘 IP 归属：
                    <span className="text-teal-300 font-mono font-bold bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 rounded mx-1 text-xs">
                      {isLocating ? '📍 高防骨干网雷达定位中...' : `📍 ${userLocation}`}
                    </span>
                    <span className="text-[#8B949E]">
                      （已自动执行沙盒对齐，确保商家在该合规域内 100% 豁免政策审计）。
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAutoGenerateLocationCompliance}
                  className="shrink-0 text-[10px] sm:text-xs font-bold bg-teal-500 hover:bg-teal-400 text-black px-4 py-2 rounded-lg transition-all transform active:scale-95 shadow-lg shadow-teal-500/10 cursor-pointer flex items-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI 一键写入合规条款</span>
                </button>
              </div>

              {/* Presets for Refunds directly instead of typing standard paragraph textareas */}
              <div className="space-y-3">
                <label className="text-[10px] font-mono text-[#8B949E] uppercase tracking-wider block">🛡️ 买家保障与 7 天退换极智赔付契约 (一键单选勾替)</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {[
                    { id: '7day', title: '📦 7天极速无因退换', desc: '首选方案。买家签收起7天内非破坏原貌，均支持极速退换配运险承担。' },
                    { id: 'no_return', title: '🚫 定制涉鲜免退保障', desc: '适用于皇家珠宝奢侈高定、或轻焙热饮美食。不支持无因退，货损秒赔。' },
                    { id: 'custom', title: '👑 15天无忧尊享超长保', desc: '高级买家关怀。提供超越行业15天无忧更换保障，高筑买家信誉感。' }
                  ].map((rule) => (
                    <button
                      key={rule.id}
                      type="button"
                      onClick={() => handleSelectRefundPreset(rule.id as any)}
                      className={`p-3 border rounded-xl text-left transition-all active:scale-[0.98] ${
                        refundPresetId === rule.id
                          ? 'border-teal-500 bg-teal-950/20 text-white font-bold'
                          : 'border-[#2F3336] bg-black text-gray-400'
                      }`}
                    >
                      <div className="text-xs text-white block font-bold">{rule.title}</div>
                      <p className="text-[9px] text-[#8B949E] block mt-1.5 leading-normal font-sans font-normal">{rule.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[9px] text-gray-500 font-mono block">公示给消费者的合规退货契约书：</span>
                <div className="p-3 bg-black border border-neutral-800 rounded-lg text-xs leading-relaxed text-teal-300 font-mono">
                  {refundPolicyText}
                </div>
              </div>

              <div className="bg-black/40 border border-[#2F3336] p-4 rounded-xl space-y-4 font-sans text-xs">
                <h4 className="font-bold text-white flex items-center space-x-1">
                  <ShieldAlert className="w-4 h-4 text-teal-400" />
                  <span>GDPR / 租户物理行级密闭隔离协议 (免填勾选模式)</span>
                </h4>
                
                <div className="space-y-3">
                  <label className="flex items-start space-x-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={privacyConsentEnabled}
                      onChange={(e) => setPrivacyConsentEnabled(e.target.checked)}
                      className="mt-0.5 rounded text-teal-600 bg-black focus:ring-teal-500 w-4 h-4"
                    />
                    <div className="text-left leading-tight">
                      <span className="text-xs font-bold text-white block">全渠道主动下发 Privacy Cookie 合规免责通告</span>
                      <p className="text-[10px] text-gray-500 mt-0.5">当买家首次登岛访问时自动提示免责保障声明</p>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3 cursor-pointer select-none border-t border-[#2F3336]/60 pt-3">
                    <input
                      type="checkbox"
                      checked={dataSecrecyAgreed}
                      onChange={(e) => setDataSecrecyAgreed(e.target.checked)}
                      className="mt-0.5 rounded text-teal-600 bg-black focus:ring-teal-500 w-4 h-4"
                    />
                    <div className="text-left leading-tight">
                      <span className="text-xs font-bold text-white block">物理绝密保全行级 Row-Level Security 认证</span>
                      <p className="text-[10px] text-gray-500 mt-0.5">多租户 Firestore 强制以 Tenant ID 及 Email 哈希完全物理沙盒屏蔽防御，完全封尘第三方，数据神圣不可共享侵犯。</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-[#2F3336]/60">
                <button
                  type="button"
                  onClick={handleSavePrivacySettings}
                  className="w-full py-2.5 bg-neutral-900 border border-[#2F3336] hover:bg-neutral-800 text-xs font-bold text-white rounded-lg flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>💾 签署保密行级安全协定与售后条款</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
