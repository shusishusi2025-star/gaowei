const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src', 'components', 'MerchantDashboard.tsx');
let fileContent = fs.readFileSync(targetFile, 'utf8');

// Identify the start index of '// 3. ADD_PRODUCT: Add a new product' (the beginning of ADD_PRODUCT block)
const startMarker = "// 3. ADD_PRODUCT: Add a new product";
const startIndex = fileContent.indexOf(startMarker);

if (startIndex === -1) {
  console.error("Could not find start marker.");
  process.exit(1);
}

// Identify the end index of 'const response = await fetch(\'/api/chat\',' (which is where the fetch actually starts)
const endMarker = "const response = await fetch('/api/chat', {";
const endIndex = fileContent.indexOf(endMarker);

if (endIndex === -1) {
  console.error("Could not find end marker.");
  process.exit(1);
}

// Generate the replacement string
const replacement = `      // 3. ADD_PRODUCT: Add a new product
      else if (actionType === 'ADD_PRODUCT') {
        const prodName = arg1;
        const prodPrice = parseFloat(arg2) || Math.floor(Math.random() * 150 + 50);
        const em = industry.id === 'catering' ? '🍛' : industry.id === 'retail' ? '📦' : '👚';
        const newItemId = 'p' + (productsList.length + Math.floor(Math.random() * 100) + 10);
        const newItem = {
          id: newItemId,
          name: prodName,
          price: prodPrice,
          stock: Math.floor(Math.random() * 200 + 100),
          image: em,
          category: industry.id === 'catering' ? '咖啡' : industry.id === 'retail' ? '居家' : '外套',
          desc: 'AI 研发打新商品',
          sales: 0,
          rating: '100%',
          specs: { sizes: ['标准'], labels: 'AI精算' }
        };

        setDoc(doc(db, 'tenants', tenantId, 'industries', industry.id, 'products', newItemId), newItem)
          .then(() => {
            setLogs((prevLogs) => [
              ...prevLogs,
              {
                id: Math.random().toString(),
                timestamp: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
                sender: 'AI商品经理',
                emoji: '👚',
                message: \`✔ 【Sidekick 自动建档】新品【\${newItem.name}】精细测款完毕，已在一键同步于前台在售状态！\`
              }
            ]);
          });
      }

      // 4. SHIP_ORDERS: Ship all pending orders
      else if (actionType === 'SHIP_ORDERS') {
        setLogs((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            timestamp: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
            sender: '物流经理',
            emoji: '🚚',
            message: \`🚚 【物流顺丰智能调度】今日待发货订单已极速发出顺丰速运！单号已回填客户。\`,
            type: 'success'
          }
        ]);
        triggerToast("顺丰速运极速发配调度成功！", 'success');
      }

      // 5. RESOLVE_COMPLAINT: Mitigate customer complaints
      else if (actionType === 'RESOLVE_COMPLAINT') {
        setLogs((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            timestamp: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
            sender: '客服专员',
            emoji: '🌸',
            message: \`💖 【AI 客怨金色通道】纠纷调停完毕！李阿姨已撤诉并给好评。\`,
            type: 'success'
          }
        ]);
        triggerToast("客怨纠纷金色调停成功！", 'success');
      }

      // 6. SET_BUDGET: Set campaign budget
      else if (actionType === 'SET_BUDGET') {
        setLogs((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            timestamp: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
            sender: '数字营销师',
            emoji: '🎯',
            message: \`🎯 【AI营销直通车】投流曝光单日预算上限已精确调整至 ¥\${arg1} 元。\`,
            type: 'success'
          }
        ]);
        triggerToast(\`营销预算成功更改为 \${arg1}\`, 'success');
      }

      // 7. WRITE_COMPLIANCE: Write policy to store DB
      else if (actionType === 'WRITE_COMPLIANCE') {
        const docText = arg1 || '根据地缘法规签署 of 通用合法保障保护协定。';
        setRefundPolicyText(docText);
        setDoc(doc(db, 'tenants', tenantId), {
          refundPolicyText: docText
        }, { merge: true })
          .then(() => {
            setLogs((prev) => [
              ...prev,
              {
                id: Math.random().toString(),
                timestamp: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
                sender: 'AI合规助手',
                emoji: '🛡️',
                message: \`🛡️ 【Sidekick 地缘智能部署】已通过 IP 地址自动识别营业地缘【\${userLocation}】，全自动热发布并签署合规契约！已展示在前台。\`,
                type: 'success'
              }
            ]);
            triggerToast(\`🛡️ 地缘合规自动部署成功 (\${userLocation})\`, 'success');
          })
          .catch(err => handleFirestoreError(err, OperationType.WRITE, \`tenants/\${tenantId}\`));
      }
    }

    return cleanMsg;
  };

  const queryBackendForText = async (searchKeyword: string) => {
    try {
      let mappedPage = '';
      if (activeMenu === 'settings') {
        const subTabNames: Record<string, string> = {
          general: '基础网店配置 (General Store Info)',
          billing: '多租户账期与ROI套餐结算 (Billing & SaaS Quotas)',
          users: '多租户多角色员工席位配置 (Sub-users & Seat RBAC Grid)',
          payments: '极速外币/本币支付通道配给 (Payment Gateways Configuration)',
          customers: 'CRM会员客群及积分维稳 (CRM Loyalties & Vip Rules)',
          logistics: '中欧空运/配送与物流履约设置 (Fulfillment & Logistics Setup)',
          marketing: '直通车投发预算与营销设置 (Direct PPC Bid & Keywords)',
          app: '模型密钥池、AI计算引擎集成 (AI Engine Model Keys Pool)',
          notifications: '客户触达极速自动通知方式 (Dynamic Customer SMTP Push & sms)',
          languages: '多语言极智自译及国际本位币规则 (Multilingual Translation rules)',
          privacy: '地缘合规性/GDPR/隐私保障与契约签署 (Legal Compliance & GDPR settings)'
        };
        mappedPage = \`设置大仓第 【\${settingsSubTab}】 子模块 - 【\${subTabNames[settingsSubTab] || settingsSubTab}】\`;
      } else {
        const pageNames: Record<string, string> = {
          workbench: "智能工作台主控大盘 (Real-time Merchant Workbench Console)",
          store: "前台顾客端微缩样板与高保真预览 (Active Retail Storefront Live Sandbox Preview)",
          product: "SPU商品极智研发、SKU属性与变体建档仓 (SPU/SKU Product Inventory Catalog Database)",
          order: "订单流核销跟单与智能顺丰一键履约 (Unified Order Delivery Dispatch Pipeline)",
          customer: "CRM客群画像、客服会商与冲突金牌调停中心 (CRM Support chat & Conflict gold mitigation center)",
          marketing: "直通车竞价、小红书数字文案投发高产引擎 (AI Marketing Copy & Advertising Campaign hub)",
          analytics: "财务多维透视与利润ROI流体报表 (Full Stack Financial Profit & ROI Balance Statement)",
          team_members: "36星宿AI数字雇员专家组协同库 (SAI Division Team Employee Roster Database)"
        };
        mappedPage = pageNames[activeMenu] || activeMenu;
      }

      const response = await fetch('/api/chat', {`;

// Replace content in the range
const updatedContent = fileContent.substring(0, startIndex) + replacement + fileContent.substring(endIndex + endMarker.length);
fs.writeFileSync(targetFile, updatedContent, 'utf8');
console.log("Successfully replaced corrupted code block.");
fs.unlinkSync(__filename); // Clean up the script itself
