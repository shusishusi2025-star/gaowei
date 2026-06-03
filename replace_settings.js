const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'MerchantDashboard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Find the start anchor and end anchor
const startAnchor = "{/* VIEW 8: SETTINGS 配置 (⚙️ 设置) */}";
const endAnchor = "{/* VIEW 9: TEAM MEMBERS (🤖 团队成员) */}";

const startIndex = content.indexOf(startAnchor);
const endIndex = content.indexOf(endAnchor);

if (startIndex === -1 || endIndex === -1) {
  console.error("Could not find start or end anchors");
  process.exit(1);
}

const replacement = `            {/* VIEW 8: SETTINGS 配置 (⚙️ 设置) */}
              {activeMenu === 'settings' && (
                (userRole === 'staff' || userRole === 'customer') ? (
                  <div className="w-full bg-[#09090B] border border-[#2F3336] p-10 rounded-xl text-center space-y-4 max-w-xl mx-auto my-12 animate-fadeIn">
                    <div className="w-12 h-12 mx-auto rounded-full bg-red-950/20 border border-red-500/30 flex items-center justify-center text-rose-500">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white tracking-tight">🚫 权限不足 (Access Restrained)</h4>
                      <p className="text-xs text-neutral-400 leading-normal">
                        您的当前席位角色为 <strong className="text-rose-400">[{userRole === 'staff' ? '运营员工' : '进店顾客'}]</strong>。修改核心模型接口、密钥池配置、算力策略等参数仅限对具有拥有者 <strong className="text-white">Founder</strong> 或高级经理 <strong className="text-white">Manager</strong> 身份授予。
                      </p>
                    </div>
                    <div className="text-[10px] font-mono text-[#8B949E] italic bg-neutral-950 p-2.5 rounded border border-neutral-800">
                      提示: 请在顶部控制中心导航栏中，切换账户角色为「创始人」或「副总裁」进行调试。
                    </div>
                  </div>
                ) : (
                  <MerchantSettingsView
                    userRole={userRole}
                    db={db}
                    tenantId={tenantId}
                    triggerToast={triggerToast}
                    industry={industry}
                    strategy={strategy}
                    productsList={productsList}
                    sales={sales}
                    mktBudget={mktBudget}
                    storeTheme={storeTheme}
                    storeHeadline={storeHeadline}
                    setStoreHeadline={setStoreHeadline}
                    brandPrimaryColor={brandPrimaryColor}
                    setBrandPrimaryColor={setBrandPrimaryColor}
                    seoHtmlTitle={seoHtmlTitle}
                    setSeoHtmlTitle={setSeoHtmlTitle}
                    seoMetaDesc={seoMetaDesc}
                    setSeoMetaDesc={setSeoMetaDesc}
                    seoKeywords={seoKeywords}
                    setSeoKeywords={setSeoKeywords}
                    
                    editBrandName={editBrandName}
                    setEditBrandName={setEditBrandName}
                    editSlogan={editSlogan}
                    setEditSlogan={setEditSlogan}
                    merchantStatus={merchantStatus}
                    merchantBillingTier={merchantBillingTier}
                    merchantTokenBalance={merchantTokenBalance}
                    merchantRechargeTotal={merchantRechargeTotal}
                    billingLogs={billingLogs}
                    handlePerformSaaSTopup={handlePerformSaaSTopup}
                    
                    apiProvider={apiProvider}
                    setApiProvider={setApiProvider}
                    geminiKey={geminiKey}
                    setGeminiKey={setGeminiKey}
                    deepseekKey={deepseekKey}
                    setDeepseekKey={setDeepseekKey}
                    openaiKey={openaiKey}
                    setOpenaiKey={setOpenaiKey}
                    ollamaEndpoint={ollamaEndpoint}
                    setOllamaEndpoint={setOllamaEndpoint}
                    ollamaModel={ollamaModel}
                    setOllamaModel={setOllamaModel}
                    ollamaModels={ollamaModels}
                    setOllamaModels={setOllamaModels}
                    ollamaSearchQuery={ollamaSearchQuery}
                    setOllamaSearchQuery={setOllamaSearchQuery}
                    customOllamaModelInput={customOllamaModelInput}
                    setCustomOllamaModelInput={setCustomOllamaModelInput}
                    isSyncingOllama={isSyncingOllama}
                    syncOllamaModelsList={syncOllamaModelsList}
                    testConnectionStatus={testConnectionStatus}
                    setTestConnectionStatus={setTestConnectionStatus}
                    testLog={testLog}
                    setTestLog={setTestLog}
                    geminiConnected={geminiConnected}
                    setGeminiConnected={setGeminiConnected}
                    
                    driveAccessToken={driveAccessToken}
                    driveUserEmail={driveUserEmail}
                    isBackingUp={isBackingUp}
                    isSearchingBackups={isSearchingBackups}
                    driveBackups={driveBackups}
                    selectedBackupId={selectedBackupId}
                    setSelectedBackupId={setSelectedBackupId}
                    isRestoring={isRestoring}
                    wipeProductsInPurge={wipeProductsInPurge}
                    setWipeProductsInPurge={setWipeProductsInPurge}
                    
                    handleConnectDrive={handleConnectDrive}
                    handleDisconnectDrive={handleDisconnectDrive}
                    handleBackupToDrive={handleBackupToDrive}
                    handleFetchBackups={handleFetchBackups}
                    handleRestoreFromDrive={handleRestoreFromDrive}
                    handleProductionPurge={handleProductionPurge}
                  />
                )
              )}

              `;

const before = content.substring(0, startIndex);
const after = content.substring(endIndex);

fs.writeFileSync(filePath, before + replacement + after, 'utf8');
console.log("Successfully replaced settings view inside MerchantDashboard.tsx");
