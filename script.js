// 初始化行政區選項
fetch('district_data.json')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        const districtSelect = document.getElementById('district');
        const sectionSelect = document.getElementById('section');
        const landNumberInput = document.getElementById('land-number');

        if (!districtSelect) {
            console.error('行政區下拉框不存在');
            return;
        }

        // 填充行政區選項
        for (const district in data) {
            const option = document.createElement('option');
            option.value = district;
            option.textContent = district;
            districtSelect.appendChild(option);
        }

        // 更新地段選項
        districtSelect.addEventListener('change', () => {
            const selectedDistrict = districtSelect.value;
            sectionSelect.innerHTML = '<option value="">請選擇地段</option>';
            sectionSelect.disabled = !selectedDistrict;

            if (selectedDistrict && data[selectedDistrict]) {
                data[selectedDistrict].forEach(section => {
                    const option = document.createElement('option');
                    option.value = section;
                    option.textContent = section;
                    sectionSelect.appendChild(option);
                });
            }

            // 禁用地號輸入框
            landNumberInput.disabled = true;
        });

        // 啟用地號輸入框
        sectionSelect.addEventListener('change', () => {
            landNumberInput.disabled = !sectionSelect.value;
        });
    })
    .catch(error => {
        console.error('Error loading district data:', error);
    });
