const sectionMapping = {
  "新園段": { file: "2802_Luzhu_Xinyuan_data.json", code: 2802 },
  "中華段": { file: "2833_Luzhu_Zhonghua_data.json", code: 2833 }
};

fetch('district_data.json')
  .then(response => response.json())
  .then(data => {
    const districtSelect = document.getElementById('district');
    const sectionSelect = document.getElementById('section');

    // 填入行政區選項
    for (const district in data) {
      const option = document.createElement('option');
      option.value = district;
      option.textContent = district;
      districtSelect.appendChild(option);
    }

    // 當選擇行政區後更新地段選項
    districtSelect.addEventListener('change', () => {
      const selectedDistrict = districtSelect.value;
      sectionSelect.innerHTML = '<option value="">請選擇地段</option>';
      if (selectedDistrict) {
        data[selectedDistrict].forEach(section => {
          const option = document.createElement('option');
          option.value = section;
          option.textContent = section;
          sectionSelect.appendChild(option);
        });
        sectionSelect.disabled = false;
      } else {
        sectionSelect.disabled = true;
      }
    });
  })
  .catch(error => console.error('Error loading district data:', error));

// 顯示或隱藏分割案件專用的輸入欄位
document.getElementById('case-type').addEventListener('change', () => {
  const caseType = document.getElementById('case-type').value;
  const partitionFields = document.getElementById('partition-fields');
  partitionFields.style.display = caseType === '分割案件' ? 'block' : 'none';
});

document.getElementById('land-form').addEventListener('submit', (event) => {
  event.preventDefault();

  const district = document.getElementById('district').value;
  const section = document.getElementById('section').value;
  const landNumber = document.getElementById('land-number').value.trim();
  const caseType = document.getElementById('case-type').value;

  if (!/^\d{5,8}$/.test(landNumber)) {
    document.getElementById('result-text').innerHTML = "地號必須是5到8位數字";
    document.getElementById('result').style.display = "block";
    return;
  }

  if (!district || !section || !landNumber || !caseType) {
    document.getElementById('result-text').innerHTML = "請完整填寫表單";
    document.getElementById('result').style.display = "block";
    return;
  }

  const mapping = sectionMapping[section];
  if (!mapping) {
    document.getElementById('result-text').innerHTML = "目前僅支援『新園段』與『中華段』的查詢";
    document.getElementById('result').style.display = "block";
    return;
  }

  fetch(mapping.file)
    .then(response => response.json())
    .then(data => {
      // 將 JSON 中的 "地段" 與 "地號" 轉換成數字進行比較
      const landData = data.find(item => Number(item.地段) === mapping.code && Number(item.地號) === Number(landNumber));
      if (landData) {
        // 若為分割案件，讀取使用者輸入的分割線段與確定界址點數
        let partitionLines = 0, confirmationPoints = 0;
        if (caseType === '分割案件') {
          partitionLines = Number(document.getElementById('partition-lines').value) || 0;
          confirmationPoints = Number(document.getElementById('confirmation-points').value) || 0;
        }
        calculateFee(landData, caseType, { partitionLines, confirmationPoints });
      } else {
        document.getElementById('result-text').innerHTML = "未找到此地號的資料";
        document.getElementById('result').style.display = "block";
      }
    })
    .catch(error => {
      console.error('Error loading data file:', error);
      document.getElementById('result-text').innerHTML = "資料讀取錯誤";
      document.getElementById('result').style.display = "block";
    });
});

function getBaseFee(area, tiers) {
  for (let i = 0; i < tiers.length; i++) {
    const tier = tiers[i];
    // 若 tier.max 為 null，表示無上限
    if (area >= tier.min && (tier.max === null || area < tier.max)) {
      return tier.baseFee;
    }
  }
  return 0;
}

function calculateFee(landData, caseType, additional) {
  // 將面積與界址點數轉換成數字
  const area = Number(landData.登記面積 || landData.面積);
  const boundaryPoints = Number(landData.界址點數 || landData.界址點數量 || 0);

  fetch('fee_standards.json')
    .then(response => response.json())
    .then(feeData => {
      // 從 feeData 找出符合選擇案件類型的資料
      const feeStandard = feeData.find(item => item["案件類型"] === caseType);
      if (!feeStandard) {
        document.getElementById('result-text').innerHTML = "費用資料錯誤";
        document.getElementById('result').style.display = "block";
        return;
      }
      const baseFee = getBaseFee(area, feeStandard.tiers);
      let extraFee = 0;

      if (caseType === '鑑界案件') {
        const pointsPerUnit = feeStandard.survey.pointsPerUnit;
        const unitFee = feeStandard.survey.unitFee;
        extraFee = Math.ceil(boundaryPoints / pointsPerUnit) * unitFee;
      } else if (caseType === '分割案件') {
        const lineFee = feeStandard.lineFee;
        const confirmationFee = feeStandard.confirmationFee;
        extraFee = (additional.partitionLines * lineFee) + (additional.confirmationPoints * confirmationFee);
      }
      const totalFee = baseFee + extraFee;
      document.getElementById('result-text').innerHTML =
        `總施測費用: ${totalFee} 元 (基本費 ${baseFee} + 加收 ${extraFee})`;
      document.getElementById('result').style.display = "block";
    })
    .catch(error => {
      console.error('Error loading fee data:', error);
      document.getElementById('result-text').innerHTML = "費用資料讀取錯誤";
      document.getElementById('result').style.display = "block";
    });
}
// 新增初始化功能（不動原始邏輯）
document.getElementById('land-form').addEventListener('submit', () => {
  document.getElementById('reset-btn').style.display = 'inline-block';
});

// 綁定初始化按鈕事件
document.getElementById('reset-btn').addEventListener('click', resetAll);

// 定義初始化功能
function resetAll() {
  // 重置表單欄位
  document.getElementById('land-form').reset();

  // 隱藏結果區域
  document.getElementById('result').style.display = 'none';
  document.getElementById('result-text').innerHTML = '';

  // 隱藏初始化按鈕
  document.getElementById('reset-btn').style.display = 'none';

  // 重設地段選項與分割欄位
  const sectionSelect = document.getElementById('section');
  sectionSelect.innerHTML = '<option value="">請先選擇行政區</option>';
  sectionSelect.disabled = true;

  document.getElementById('partition-fields').style.display = 'none';
}
