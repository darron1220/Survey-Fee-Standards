// Fetch the JSON data for district and section options
fetch('district_data.json')
    .then(response => response.json())
    .then(data => {
        const districtSelect = document.getElementById('district');
        const sectionSelect = document.getElementById('section');

        // Fill in the district select options
        for (const district in data) {
            const option = document.createElement('option');
            option.value = district;
            option.textContent = district;
            districtSelect.appendChild(option);
        }

        // When a district is selected, update the section options
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

// Handle form submission to fetch area and boundary points, and calculate fee
document.getElementById('land-form').addEventListener('submit', (event) => {
    event.preventDefault();

    const district = document.getElementById('district').value;
    const section = document.getElementById('section').value;
    const landNumber = document.getElementById('land-number').value;

    // Validate the land number input to be 8 digits
    if (!/^\d{8}$/.test(landNumber)) {
        document.getElementById('result-text').innerHTML = "地號必須是8位數字";
        return;
    }

    if (district && section && landNumber) {
        // Fetch the data for the selected district and section from the JSON files
        fetch('2802_路竹新園_data.json')
            .then(response => response.json())
            .then(路竹新園_data => {
                const landData = 路竹新園_data.find(item => item.地段 === section && item.地號 == landNumber);
                if (!landData) {
                    fetch('2833_中華_data.json')
                        .then(response => response.json())
                        .then(中華_data => {
                            const landData = 中華_data.find(item => item.地段 === section && item.地號 == landNumber);
                            if (landData) {
                                calculateFee(landData);
                            } else {
                                document.getElementById('result-text').innerHTML = "未找到此地號的資料";
                            }
                        });
                } else {
                    calculateFee(landData);
                }
            });

        function calculateFee(landData) {
            const area = landData.登記面積 || landData.面積;
            const boundaryPoints = landData.界址點數 || landData.界址點數量;

            // Fetch the fee standards data and calculate the total fee
            fetch('fee_standards.json')
                .then(response => response.json())
                .then(feeData => {
                    // Example logic to calculate total fee based on area and boundary points
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
                .catch(error => console.error('Error loading fee data:', error));
        }
    } else {
        document.getElementById('result-text').innerHTML = "請完整填寫表單";
    }
});
