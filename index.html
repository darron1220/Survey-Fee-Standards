fetch('district_data.json')
    .then(response => response.json())
    .then(data => {
        const districtSelect = document.getElementById('district');
        const sectionSelect = document.getElementById('section');
        const landNumberInput = document.getElementById('land-number');

        for (const district in data) {
            const option = document.createElement('option');
            option.value = district;
            option.textContent = district;
            districtSelect.appendChild(option);
        }

        districtSelect.addEventListener('change', () => {
            const selectedDistrict = districtSelect.value;
            sectionSelect.innerHTML = '<option value="">請選擇地段</option>';
            landNumberInput.disabled = true;
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

        sectionSelect.addEventListener('change', () => {
            landNumberInput.disabled = !sectionSelect.value;
        });
    })
    .catch(error => console.error('Error loading district data:', error));

document.getElementById('land-form').addEventListener('submit', (event) => {
    event.preventDefault();

    const district = document.getElementById('district').value;
    const section = document.getElementById('section').value;
    const landNumber = document.getElementById('land-number').value;

    if (!/^\d{8}$/.test(landNumber)) {
        document.getElementById('result-text').innerHTML = "地號必須是8位數字";
        return;
    }

    fetch('2802_路竹新園_data.json')
        .then(response => response.json())
        .then(data => {
            const landData = data.find(item => item.地段 === section && item.地號 === landNumber);
            if (landData) {
                calculateFee(landData);
            } else {
                document.getElementById('result-text').innerHTML = "未找到此地號的資料";
            }
        })
        .catch(error => console.error('Error fetching data:', error));
});

function calculateFee(landData) {
    const area = landData.登記面積;
    const boundaryPoints = landData.界址點數;

    fetch('fee_standards.json')
        .then(response => response.json())
        .then(feeData => {
            let feePerSquareMeter = 0;
            if (area <= 200) feePerSquareMeter = feeData[0]['宗地面積<200'];
            else if (area <= 1000) feePerSquareMeter = feeData[0]['1000<宗地面積≦200'];
            else if (area <= 10000) feePerSquareMeter = feeData[0]['10000<宗地面積≦1000'];
            else feePerSquareMeter = feeData[0]['10000≦宗地面積'];

            const totalFee = area * feePerSquareMeter + boundaryPoints * feeData[0]['施測費'];
            document.getElementById('result-text').innerHTML = `
                登記面積：${area} 平方公尺<br>
                界址點數：${boundaryPoints} 點<br>
                總施測費用：${totalFee} 元
            `;
        })
        .catch(error => console.error('Error loading fee standards:', error));
}
