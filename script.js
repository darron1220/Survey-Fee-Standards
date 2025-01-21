// 初始化行政區和地段選項
fetch('district_data.json')
    .then(response => {
        if (!response.ok) throw new Error(`Failed to fetch district data: ${response.statusText}`);
        return response.json();
    })
    .then(data => {
        const districtSelect = document.getElementById('district');
        const sectionSelect = document.getElementById('section');
        const landNumberInput = document.getElementById('land-number');

        // 填充行政區選項
        Object.keys(data).forEach(district => {
            const option = document.createElement('option');
            option.value = district;
            option.textContent = district;
            districtSelect.appendChild(option);
        });

        // 更新地段選項
        districtSelect.addEventListener('change', () => {
            const selectedDistrict = districtSelect.value;
            sectionSelect.innerHTML = '<option value="">請選擇地段</option>';
            sectionSelect.disabled = !selectedDistrict;

            if (selectedDistrict) {
                data[selectedDistrict].forEach(section => {
                    const option = document.createElement('option');
                    option.value = section;
                    option.textContent = section;
                    sectionSelect.appendChild(option);
                });
            }

            landNumberInput.disabled = true;
        });

        sectionSelect.addEventListener('change', () => {
            landNumberInput.disabled = !sectionSelect.value;
        });
    })
    .catch(error => console.error('Error loading district data:', error));

// 查詢表單提交事件
document.getElementById('land-form').addEventListener('submit', (event) => {
    event.preventDefault();

    const district = document.getElementById('district').value;
    const section = document.getElementById('section').value;
    const landNumber = document.getElementById('land-number').value;

    if (!/^\d{8}$/.test(landNumber)) {
        showResult("地號必須是8位數字");
        return;
    }

    fetch('2802_路竹新園_data.json')
        .then(response => response.json())
        .then(data => {
            const landData = data.find(item =>
                item.地段 === section && item.地號 === landNumber
            );

            if (landData) {
                calculateFee(landData);
            } else {
                showResult("未找到此地號的資料");
            }
        })
        .catch(error => console.error('Error fetching land data:', error));
});

function calculateFee(landData) {
    const area = landData.登記面積;
    const boundaryPoints = landData.界址點數;

    // 使用內嵌的費用規則
    let feePerSquareMeter = 0;
    if (area <= 200) feePerSquareMeter = 2500;
    else if (area <= 1000) feePerSquareMeter = 3000;
    else if (area <= 10000) feePerSquareMeter = 3500;
    else feePerSquareMeter = 4000;

    const measurementFee = boundaryPoints * 1000;
    const totalFee = area * feePerSquareMeter + measurementFee;

    showResult(`
        登記面積：${area} 平方公尺<br>
        界址點數：${boundaryPoints} 點<br>
        總施測費用：${totalFee} 元
    `);
}

function showResult(message) {
    const resultDiv = document.getElementById('result');
    const resultText = document.getElementById('result-text');
    resultText.innerHTML = message;
    resultDiv.style.display = "block";
}
