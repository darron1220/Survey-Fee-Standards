const sectionMapping = {
  "新園段": { file: "2802_路竹新園_data.json", code: 2802 },
  "中華段": { file: "2833_中華_data.json", code: 2833 }
};

// 取得行政區與地段選單資料
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

    // 當選擇行政區後，更新地段選項
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

// 處理查詢表單提交，根據 mapping 進行資料查詢與費用計算
document.getElementById('land-form').addEventListener('submit', (event) => {
  event.preventDefault();

  const district = document.getElementById('district').value;
  const section = document.getElementById('section').value;
  const landNumber = document.getElementById('land-number').value.trim();

  // 驗證地號是否為8位數字
  if (!/^\d{8}$/.test(landNumber)) {
    document.getElementById('result-text').innerHTML = "地號必須是8位數字";
    return;
  }

  if (district && section && landNumber) {
    // 利用 mapping 取得對應檔案與地段代碼
    const mapping = sectionMapping[section];
    if (!mapping) {
      document.getElementById('result-text').innerHTML = "目前僅支援『新園段』與『中華段』的查詢";
      return;
    }

    fetch(mapping.file)
      .then(response => response.json())
      .then(data => {
        // 根據 mapping.code 與輸入的地號進行比對
        const landData = data.find(item => item.地段 === mapping.code && item.地號 === Number(landNumber));
        if (landData) {
          calculateFee(landData);
        } else {
          document.getElementById('result-text').innerHTML = "未找到此地號的資料";
        }
      })
      .catch(error => {
        console.error('Error loading data file:', error);
        document.getElementById('result-text').innerHTML = "資料讀取錯誤";
      });
  } else {
    document.getElementById('result-text').innerHTML = "請完整填寫表單";
  }
});

// 根據查詢到的土地資料計算總施測費用
function calculateFee(landData) {
  const area = landData.登記面積 || landData.面積;
  const boundaryPoints = landData.界址點數 || landData.界址點數量;

  fetch('fee_standards.json')
    .then(response => response.json())
    .then(feeData => {
      let feePerSquareMeter;
      if (area <= 200) {
        feePerSquareMeter = feeData[0]['宗地面積<200'];
      } else if (area <= 1000) {
        feePerSquareMeter = feeData[0]['1000<宗地面積≦200'];
      } else if (area <= 10000) {
        feePerSquareMeter = feeData[0]['10000<宗地面積≦1000'];
      } else {
        feePerSquareMeter = feeData[0]['10000≦宗地面積'];
      }
      const totalFee = (area * feePerSquareMeter) + (boundaryPoints * feeData[0]['施測費']);
      document.getElementById('result-text').innerHTML = `總施測費用: ${totalFee} 元`;
    })
    .catch(error => {
      console.error('Error loading fee data:', error);
      document.getElementById('result-text').innerHTML = "費用資料讀取錯誤";
    });
}
