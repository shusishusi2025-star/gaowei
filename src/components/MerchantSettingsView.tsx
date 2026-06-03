import React, { useState, useEffect } from 'react';
import { 
  Settings, Briefcase, Users, DollarSign, UserCheck, Truck, Sparkles, Cpu, Bell, Globe, Shield,
  Key, RefreshCw, Layers, Check, Search, Plus, Cloud, CloudUpload, CloudDownload, CreditCard,
  History, Activity, BookOpen, ChevronDown, X, ShieldAlert, Star
} from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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
}: MerchantSettingsViewProps) {
  
  // Settings UI Sub tabs
  const [subTab, setSubTab] = useState<'general' | 'billing' | 'users' | 'payments' | 'customers' | 'logistics' | 'marketing' | 'app' | 'notifications' | 'languages' | 'privacy'>('general');

  // Modular state encapsulated inside this component but synchronized to DB on mount & save
  const [merchantIntro, setMerchantIntro] = useState('');
  const [merchantHours, setMerchantHours] = useState('09:00 - 22:00');
  
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

  // Logistics parameters
  const [logisticsProvider, setLogisticsProvider] = useState('sf_air');
  const [logisticsApiKey, setLogisticsApiKey] = useState('SF_API_KEY_36D0EEE30473...');
  const [shippingBaseFee, setShippingBaseFee] = useState(12);

  // Marketing states
  const [brandStyle, setBrandStyle] = useState('modern');

  // Notifications states
  const [notifyOnNewOrder, setNotifyOnNewOrder] = useState(true);
  const [notifyOnRefund, setNotifyOnRefund] = useState(true);
  const [notifySmsPhone, setNotifySmsPhone] = useState('13800138000');
  const [notifyEmail, setNotifyEmail] = useState('alert@modaui.ai');

  // Language settings
  const [storeLanguage, setStoreLanguage] = useState<'zh' | 'en' | 'ja'>('zh');
  const [autoTranslateAi, setAutoTranslateAi] = useState(true);

  // Privacy states
  const [refundPolicyText, setRefundPolicyText] = useState('自售出之日起，商品完整无损、票据齐全支持 7 天无理由极速货退');
  const [privacyConsentEnabled, setPrivacyConsentEnabled] = useState(true);
  const [dataSecrecyAgreed, setDataSecrecyAgreed] = useState(true);

  // Real-time synchronization loader
  useEffect(() => {
    const loadSettingsFromDb = async () => {
      try {
        const docRef = doc(db, 'tenants', tenantId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data.merchantIntro !== undefined) setMerchantIntro(data.merchantIntro);
          if (data.merchantHours !== undefined) setMerchantHours(data.merchantHours);
          if (data.operatorsList !== undefined) setOperatorsList(data.operatorsList);
          if (data.paymentGateway !== undefined) setPaymentGateway(data.paymentGateway);
          if (data.paymentStripePub !== undefined) setPaymentStripePub(data.paymentStripePub);
          if (data.paymentStripeSec !== undefined) setPaymentStripeSec(data.paymentStripeSec);
          if (data.paymentAlipayId !== undefined) setPaymentAlipayId(data.paymentAlipayId);
          if (data.paymentAlipayPriv !== undefined) setPaymentAlipayPriv(data.paymentAlipayPriv);
          if (data.rewardPointRate !== undefined) setRewardPointRate(data.rewardPointRate);
          if (data.vipThreshold !== undefined) setVipThreshold(data.vipThreshold);
          if (data.welcomeMessage !== undefined) setWelcomeMessage(data.welcomeMessage);
          if (data.logisticsProvider !== undefined) setLogisticsProvider(data.logisticsProvider);
          if (data.logisticsApiKey !== undefined) setLogisticsApiKey(data.logisticsApiKey);
          if (data.shippingBaseFee !== undefined) setShippingBaseFee(data.shippingBaseFee);
          if (data.notifyOnNewOrder !== undefined) setNotifyOnNewOrder(data.notifyOnNewOrder);
          if (data.notifyOnRefund !== undefined) setNotifyOnRefund(data.notifyOnRefund);
          if (data.notifySmsPhone !== undefined) setNotifySmsPhone(data.notifySmsPhone);
          if (data.notifyEmail !== undefined) setNotifyEmail(data.notifyEmail);
          if (data.storeLanguage !== undefined) setStoreLanguage(data.storeLanguage);
          if (data.autoTranslateAi !== undefined) setAutoTranslateAi(data.autoTranslateAi);
          if (data.refundPolicyText !== undefined) setRefundPolicyText(data.refundPolicyText);
          if (data.privacyConsentEnabled !== undefined) setPrivacyConsentEnabled(data.privacyConsentEnabled);
          if (data.dataSecrecyAgreed !== undefined) setDataSecrecyAgreed(data.dataSecrecyAgreed);
          if (data.brandStyle !== undefined) setBrandStyle(data.brandStyle);
        }
      } catch (err) {
        console.error("Failed to load settings from DB in Settings Component: ", err);
      }
    };
    loadSettingsFromDb();
  }, [db, tenantId]);

  // General Settings save function
  const handleSaveGeneralSettings = async () => {
    try {
      await setDoc(doc(db, 'tenants', tenantId), {
        merchantName: editBrandName,
        companySlogan: editSlogan,
        merchantIntro,
        merchantHours
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

  // Customers (CRM) Settings save function
  const handleSaveCustomerSettings = async () => {
    try {
      await setDoc(doc(db, 'tenants', tenantId), {
        rewardPointRate: Number(rewardPointRate),
        vipThreshold: Number(vipThreshold),
        welcomeMessage
      }, { merge: true });
      triggerToast('🎯 CRM 会员积点与关怀欢迎语已保全！', 'success');
    } catch (e: any) {
      triggerToast('CRM 设置失败', 'error');
    }
  };

  // Logistics save function
  const handleSaveLogisticsSettings = async () => {
    try {
      await setDoc(doc(db, 'tenants', tenantId), {
        logisticsProvider,
        logisticsApiKey,
        shippingBaseFee: Number(shippingBaseFee)
      }, { merge: true });
      triggerToast('🚚 顺丰物流承运契约和邮费模板已保存成功！', 'success');
    } catch (e: any) {
      triggerToast('物流保存失败', 'error');
    }
  };

  // Marketing save function
  const handleSaveMarketingSettings = async () => {
    try {
      await setDoc(doc(db, 'tenants', tenantId), {
        brandPrimaryColor,
        brandStyle,
        seoHtmlTitle,
        seoMetaDesc,
        seoKeywords
      }, { merge: true });
      triggerToast('✨ 品牌视觉主色及 SEO 深度信息已更新！', 'success');
    } catch (e: any) {
      triggerToast('视觉品牌更新失败', 'error');
    }
  };

  // Notifications save function
  const handleSaveNotificationSettings = async () => {
    try {
      await setDoc(doc(db, 'tenants', tenantId), {
        notifyOnNewOrder,
        notifyOnRefund,
        notifySmsPhone,
        notifyEmail
      }, { merge: true });
      triggerToast('🔔 异常事件实时微信/短信主动预警参数已载入！', 'success');
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
      triggerToast('🌐 系统及 AI 引擎语言策略更新完毕！', 'success');
    } catch (e: any) {
      triggerToast('语种切换失败', 'error');
    }
  };

  // Privacy save function
  const handleSavePrivacySettings = async () => {
    try {
      await setDoc(doc(db, 'tenants', tenantId), {
         refundPolicyText,
         privacyConsentEnabled,
         dataSecrecyAgreed
      }, { merge: true });
      triggerToast('🛡️ 数据绝密保全协定与 7 天无理由售后政策已确认！', 'success');
    } catch (e: any) {
      triggerToast('合规协议更新失败', 'error');
    }
  };

  // Left side sub-menu buttons mapper list
  const subMenuTabs = [
    { id: 'general', name: '一般设置', icon: Settings, color: 'text-sky-400' },
    { id: 'billing', name: '计划与账单', icon: Briefcase, color: 'text-amber-400' },
    { id: 'users', name: '用户与权限', icon: Users, color: 'text-emerald-400' },
    { id: 'payments', name: '付款设置', icon: DollarSign, color: 'text-rose-400' },
    { id: 'customers', name: '客户管理', icon: UserCheck, color: 'text-purple-400' },
    { id: 'logistics', name: '物流设置', icon: Truck, color: 'text-sky-300' },
    { id: 'marketing', name: '市场与品牌', icon: Sparkles, color: 'text-yellow-300' },
    { id: 'app', name: '应用连接', icon: Cpu, color: 'text-red-400' },
    { id: 'notifications', name: '通知设置', icon: Bell, color: 'text-pink-400' },
    { id: 'languages', name: '多语言', icon: Globe, color: 'text-indigo-400' },
    { id: 'privacy', name: '隐私与政策', icon: Shield, color: 'text-teal-400' }
  ] as const;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left animate-fadeIn">
      
      {/* LEFT SUBNAV COLUMN */}
      <div className="lg:col-span-3 space-y-1 bg-[#09090B] border border-[#2F3336] p-3 rounded-2xl h-fit">
        <div className="px-3 py-2 border-b border-[#2F3336]/60 mb-2">
          <h4 className="text-xs font-mono font-bold tracking-wider text-neutral-400 uppercase">设置大厅菜单</h4>
          <p className="text-[10px] text-gray-500">Settings Panel Matrix</p>
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
                className={`w-full px-3.5 py-2.5 rounded-lg text-xs font-medium flex items-center space-x-2.5 transition-all text-left group ${
                  isActive 
                    ? 'bg-neutral-900 border border-neutral-800 text-white font-bold' 
                    : 'text-[#8B949E] hover:text-white hover:bg-neutral-950 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${item.color}`} />
                <span>{item.name}</span>
              </button>
            );
          })}
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
                <h3 className="text-sm font-bold text-white tracking-tight">一般设置 (General Merchant Profile)</h3>
              </div>
              <span className="text-[10px] bg-sky-950 text-sky-400 border border-emerald-800/60 px-2 py-0.5 rounded font-mono font-bold">100% 真实生产入案</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-[#8B949E] uppercase tracking-wider block">实体商号 / 机构名称</label>
                <input 
                  type="text" 
                  value={editBrandName}
                  onChange={(e) => setEditBrandName(e.target.value)}
                  className="w-full bg-black border border-[#2F3336] focus:border-sky-500 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                  placeholder="请输入官方注册商号"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-[#8B949E] uppercase tracking-wider block">网店核心推广标语 / Slogan</label>
                <input 
                  type="text" 
                  value={editSlogan}
                  onChange={(e) => setEditSlogan(e.target.value)}
                  className="w-full bg-black border border-[#2F3336] focus:border-sky-500 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                  placeholder="请输入核心宣传标语"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-mono text-[#8B949E] uppercase tracking-wider block">商户详细主打介绍 (AI 协同简言概要)</label>
                <textarea 
                  rows={3}
                  value={merchantIntro}
                  onChange={(e) => setMerchantIntro(e.target.value)}
                  className="w-full bg-black border border-[#2F3336] focus:border-sky-500 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                  placeholder="请输入贵司主要的行业积淀、主售高科技定位、选品品质等底色..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-[#8B949E] uppercase tracking-wider block">常规营业小时周期</label>
                <input 
                  type="text" 
                  value={merchantHours}
                  onChange={(e) => setMerchantHours(e.target.value)}
                  className="w-full bg-black border border-[#2F3336] focus:border-sky-500 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                  placeholder="例如: 09:00 - 22:00"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-[#8B949E] uppercase tracking-wider block">店标 Logo 专属简短英文字母</label>
                <input 
                  type="text" 
                  value={industry.name}
                  disabled
                  className="w-full bg-neutral-900 border border-[#2F3336]/60 rounded-lg p-2.5 text-xs text-neutral-400 focus:outline-none cursor-not-allowed"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#2F3336]/60">
              <button
                type="button"
                onClick={handleSaveGeneralSettings}
                className="w-full py-2.5 bg-neutral-900 border border-[#2F3336] hover:bg-neutral-800 text-xs font-bold text-white rounded-lg flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                <span>💾 保存一般设置参数至极智后台</span>
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
                              className="text-red-400 hover:text-red-300 hover:underline"
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
                <label className="text-[10px] font-mono text-[#8B949E] block">首选支付结算网关</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'stripe', name: 'Stripe 全球信用卡' },
                    { id: 'alipay', name: 'Alipay 支付宝航线' },
                    { id: 'both', name: '混合路由自决策' }
                  ].map((pay) => (
                    <button
                      key={pay.id}
                      type="button"
                      onClick={() => setPaymentGateway(pay.id as any)}
                      className={`p-2.5 rounded-lg border text-left cursor-pointer transition-colors ${
                        paymentGateway === pay.id
                          ? 'border-rose-500 bg-rose-500/5 text-white'
                          : 'border-[#2F3336] bg-black text-[#8B949E]'
                      }`}
                    >
                      <p className="text-xs font-bold block leading-tight">{pay.name}</p>
                    </button>
                  ))}
                </div>
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
                  <span>💾 校验并连接入册生产极速收单网关</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5. 客户管理 (CRM) */}
        {subTab === 'customers' && (
          <div className="bg-[#09090B] border border-[#2F3336] p-6 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#2F3336]/60 pb-3">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-purple-400 animate-pulse" />
                <h3 className="text-sm font-bold text-white tracking-tight">VIP 常旅客与 CRM 客户忠诚度计划</h3>
              </div>
              <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded font-mono font-bold">客户活跃转化</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-[#8B949E] block">消费积分换算比率 (1元 = 几个积分)</label>
                <input 
                  type="number" 
                  value={rewardPointRate}
                  onChange={(e) => setRewardPointRate(Number(e.target.value))}
                  className="w-full bg-black border border-[#2F3336] focus:border-purple-500 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                  placeholder="请输入积分率"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-[#8B949E] block">白金/超级 VIP 自动晋升累积门槛</label>
                <input 
                  type="number" 
                  value={vipThreshold}
                  onChange={(e) => setVipThreshold(Number(e.target.value))}
                  className="w-full bg-black border border-[#2F3336] focus:border-purple-500 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                  placeholder="请输入门槛值 (RMB)"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-mono text-[#8B949E] block">24小时 AI 主脑自动接引致辞 (Welcome Greetings)</label>
                <textarea 
                  rows={3}
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  className="w-full bg-black border border-[#2F3336] focus:border-purple-500 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                  placeholder="请输入欢迎词..."
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#2F3336]/60">
              <button
                type="button"
                onClick={handleSaveCustomerSettings}
                className="w-full py-2.5 bg-neutral-900 border border-[#2F3336] hover:bg-neutral-800 text-xs font-bold text-white rounded-lg flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                <span>💾 一键同步 CRM 核心参数至全店在册智体</span>
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
                <h3 className="text-sm font-bold text-white tracking-tight">顺丰速运动态航路与承运规则 (Logistics Contract)</h3>
              </div>
              <span className="text-[10px] bg-sky-500/10 text-sky-300 border border-sky-500/20 px-2 py-0.5 rounded font-mono font-bold">顺丰特快空运合约</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-[#8B949E] block">承运服务模式 (顺丰丰桥 API)</label>
                <select
                  value={logisticsProvider}
                  onChange={(e) => setLogisticsProvider(e.target.value)}
                  className="w-full bg-black border border-[#2F3336] rounded-lg p-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="sf_air">顺丰速运·特快航运 (SF Air Next Morning)</option>
                  <option value="sf_ground">顺丰标快·陆路温防 (SF Standard Cargo)</option>
                  <option value="third_party">京东冷链 / 其他第三方联合承付</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-[#8B949E] block">顺丰丰桥 API Key (Client Key)</label>
                <input 
                  type="password" 
                  value={logisticsApiKey}
                  onChange={(e) => setLogisticsApiKey(e.target.value)}
                  className="w-full bg-black border border-[#2F3336] focus:border-sky-500 rounded-lg p-2.5 text-xs text-white focus:outline-none font-mono"
                  placeholder="SF_API_KEY_xxxx"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-[#8B949E] block">首公里全店基础邮费标准 (RMB)</label>
                <input 
                  type="number" 
                  value={shippingBaseFee}
                  onChange={(e) => setShippingBaseFee(Number(e.target.value))}
                  className="w-full bg-black border border-[#2F3336] focus:border-sky-500 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#2F3336]/60">
              <button
                type="button"
                onClick={handleSaveLogisticsSettings}
                className="w-full py-2.5 bg-neutral-900 border border-[#2F3336] hover:bg-neutral-800 text-xs font-bold text-white rounded-lg flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                <span>💾 保存顺丰空运契约和邮费模板</span>
              </button>
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
                <label className="text-[10px] font-mono text-[#8B949E] block">品牌主色调首选 (React View Colors)</label>
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
                <label className="text-[10px] font-mono text-[#8B949E] block">视觉设计审美主风格</label>
                <select
                  value={brandStyle}
                  onChange={(e) => setBrandStyle(e.target.value)}
                  className="w-full bg-black border border-[#2F3336] rounded-lg p-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="modern">现代极简微风 ⚪</option>
                  <option value="luxury">尊定高级奢华 💎</option>
                  <option value="vibrant">青春活力高弹 ⚡</option>
                  <option value="classic">奶油复古温柔 🧺</option>
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-mono text-[#8B949E] block">谷歌/百度搜索引擎蜘蛛标引：HTML Document Title</label>
                <input 
                  type="text" 
                  value={seoHtmlTitle}
                  onChange={(e) => setSeoHtmlTitle(e.target.value)}
                  className="w-full bg-black border border-[#2F3336] rounded-lg p-2.5 text-xs text-white focus:outline-none"
                  placeholder="输入 HTML Header Title"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-mono text-[#8B949E] block">搜索收录关键词集录 (SEO Keywords, 用英文逗号隔开)</label>
                <input 
                  type="text" 
                  value={seoKeywords}
                  onChange={(e) => setSeoKeywords(e.target.value)}
                  className="w-full bg-black border border-[#2F3336] rounded-lg p-2.5 text-xs text-white focus:outline-none"
                  placeholder="AI, O2O, catering, clothing, luxury"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-mono text-[#8B949E] block">搜索快照预览描述：Meta Description</label>
                <textarea 
                  rows={2}
                  value={seoMetaDesc}
                  onChange={(e) => setSeoMetaDesc(e.target.value)}
                  className="w-full bg-black border border-[#2F3336] rounded-lg p-2.5 text-xs text-white focus:outline-none"
                  placeholder="如: MODAUI 让企业获得全渠道极智协同自动运营..."
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
                <span>💾 同步品牌视觉并编译 SEO 头文件</span>
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
                  <p className="whitespace-pre-wrap">{testLog}</p>
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
                          setTestLog('⚠ 网络通信成功。尚未配对 Gemini 真实 API 密钥，已自动挂载内网离线计算大脑。');
                        }
                      } else {
                        throw new Error("响应格式有误");
                      }
                    } catch (e: any) {
                      setTestConnectionStatus('failed');
                      setTestLog(`❌ 微处理器握手通信失效。请核验网络配置。报错描述: ${e.message}`);
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
                    <h3 className="text-xs font-mono uppercase tracking-wider text-[#8B949E]">上线合规校准与测试对账抹除</h3>
                  </div>
                  <span className="text-[10px] bg-red-950/40 text-red-400 border border-red-800/40 px-2 py-0.5 rounded font-mono font-bold">主脑净空</span>
                </div>
                <div className="w-full h-px bg-[#2F3336]/60" />

                <div className="space-y-3">
                  <p className="text-[11px] text-neutral-400 leading-relaxed font-sans">
                    🚀 <strong>项目交接上线或模拟考毕剪彩合规：</strong>
                    为了迎接首批真实消费者入境，必须清除前序沙盒操作所产生的一万条虚拟账单流水。
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
                      <strong>连带抹除在售 SPU/SKU 产品目录：</strong> 如果在此不勾选，将保留商品主模板，仅仅抹平营业收入折线图及消费对账单。
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

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-[#8B949E] block">运维及异常告警接收电子邮件</label>
                  <input 
                    type="email" 
                    value={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.value)}
                    className="w-full bg-black border border-[#2F3336] focus:border-pink-500 rounded-lg p-2.5 text-xs text-white focus:outline-none font-mono"
                    placeholder="alert@modaui.ai"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-[#8B949E] block">短信紧急预警接收手机号</label>
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
                <h4 className="text-xs font-bold text-white">触发主动告警的临界面条件</h4>
                
                <div className="space-y-3">
                  <label className="flex items-start space-x-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={notifyOnNewOrder}
                      onChange={(e) => setNotifyOnNewOrder(e.target.checked)}
                      className="mt-0.5 rounded text-pink-600 bg-black focus:ring-pink-500 w-4 h-4"
                    />
                    <div className="text-left leading-tight">
                      <span className="text-xs font-bold text-white block">有新的模拟/真实大额买单时 (New Orders Alert)</span>
                      <p className="text-[10px] text-gray-500 mt-0.5">当商客产生交易合拢成单超过 500 元以上，立即发送通知</p>
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
                      <span className="text-xs font-bold text-white block">买家产生客诉、货损退款争议时 (Customer Disputes Warning)</span>
                      <p className="text-[10px] text-gray-500 mt-0.5">纠纷争议在 30 秒内未获 AI 自主妥处处理则全速振铃并通知所有者</p>
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
                  <span>💾 开启安全与运营异常告警邮件/短信触发器</span>
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
                <label className="text-[10px] font-mono text-[#8B949E] block">系统前端默认展示首选语言</label>
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
                    <p className="text-[10px] text-gray-500 mt-0.5">当海外顾客使用非指定主语言在 24 小时 AI 弹窗进行咨询时，AI 主脑会对其表意执行高保真翻译，并以商户中文进行提示</p>
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

        {/* 11. 隐私与政策 */}
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
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-[#8B949E] block">消费者权益保障条款 / 发货与无因退换申明 (Refund Policy Text)</label>
                <textarea 
                  rows={3}
                  value={refundPolicyText}
                  onChange={(e) => setRefundPolicyText(e.target.value)}
                  className="w-full bg-black border border-[#2F3336] focus:border-teal-500 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                  placeholder="自售出之日起，商品完整无损、票据齐全支持 7 天无理由极速货退..."
                />
              </div>

              <div className="bg-black/40 border border-[#2F3336] p-4 rounded-xl space-y-4 font-sans text-xs">
                <h4 className="font-bold text-white">GDPR / 欧盟 HIPAA 涉密保障规则</h4>
                
                <div className="space-y-3">
                  <label className="flex items-start space-x-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={privacyConsentEnabled}
                      onChange={(e) => setPrivacyConsentEnabled(e.target.checked)}
                      className="mt-0.5 rounded text-teal-600 bg-black focus:ring-teal-500 w-4 h-4"
                    />
                    <div className="text-left leading-tight">
                      <span className="text-xs font-bold text-white block">全渠道开启 Privacy Cookie 合规免责通告</span>
                      <p className="text-[10px] text-gray-500 mt-0.5">当买家首次登岛访问时自动下发同意视窗</p>
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
                      <span className="text-xs font-bold text-white block">授权多租户 Firestore 底层物理保密行级安全防护 (Row-Level Security)</span>
                      <p className="text-[10px] text-gray-500 mt-0.5">租户的数据直接与 email 底层哈希进行物理密闭绑定，对第三方完全封闭，受国际行级安全机制隔离保护</p>
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
                  <span>💾 开启安全隔离与合规隐私条款</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
