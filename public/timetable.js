//import {} from "firebase";

const dotws = { 1: "月", 2: "火", 3: "水", 4: "木", 5: "金", 6: "土", 8: "日" };
const au = firebase.auth();
const db = firebase.firestore();
const collection = db.collection('Timetable');
const template = collection.doc('template');

au.onAuthStateChanged(user => {
    if (user) {
        dataRequest(user.uid);
    } else {
        alert('ログインが必要です\nログインページに移動します');
        location.href = './login';
    }
});

const signoutButton = document.getElementById('signout').addEventListener('click', event => signout());
const updateSubButton = document.getElementById('updateSub').addEventListener('click', event => updateSub());

function signout() {
    au.signOut()
        .then(alert('サインアウトに成功しました'))
        .catch(e => {
            alert('通信に失敗しました\n' + e);
        });
}

function updateSub() {
    const uid = au.currentUser.uid;
    if (document.getElementById('periodSub').value != '0' && document.getElementById('dotwSub').value != '0') {
        const period = parseInt (document.getElementById('periodSub').value,10);
        const dotw = parseInt(document.getElementById('dotwSub').value,10);
        const name = document.getElementById('nameSub').value;
        const remarks = document.getElementById('remarksSub').value;
        const key =`${dotw}${period}`;
        const subject = {
            [key]: {
                period: period,
                dotw: dotw,
                name: name,
                remarks: remarks
            }
        }
        collection.doc(uid).set(subject, { merge: true })
            .then(() => {
                writeSub(subject[key]);
                document.getElementById('nameSub').value = ""
                document.getElementById('remarksSub').value = ""
            })
            .catch(e => {
                alert('通信に失敗しました\n' + e);
            });
    } else {
        alert('曜日･時間を入力して下さい');
    }
}


async function dataRequest(uid) {
    let data = await collection.doc(uid).get();
    if (!(data = data.data())) {
        data = await template.get().catch(e => errorMessage(e))
        data = data.data();
        await collection.doc(uid).set(data, { merge: true }).catch(e => errorMessage(e))
    }
    makeSelect(data.dotw, data.period);
    makeTable(data.dotw, data.period);
    writeAllSub(data);
    return data;
}

function errorMessage(e) {
    alert('エラーが発生しました\n' + e + '\nページを更新します');
    location.reload();
}

function makeSelect(dotw, period) {
    const periodSub = document.getElementById('periodSub');
    const dotwSub = document.getElementById('dotwSub');
    for (let i = 0; i <= 10; i++) {
        let optionPeriod = document.createElement('option');
        let optionDotw = document.createElement('option');
        if (i === 0) {
            optionPeriod.value =0 ;
            optionPeriod.label = "選択";
            optionDotw.value = 0;
            optionDotw.label = '選択';
        } else {
            if (i <= period) {
                optionPeriod.value = i;
                optionPeriod.label = i;
            }
            if (i <= dotw) {
                optionDotw.value = i;
                optionDotw.label = dotws[i];
            }
            if (i > period && i > dotw) break;
        }
        periodSub.appendChild(optionPeriod);
        dotwSub.appendChild(optionDotw);
    }
}

function makeTable(dotw, period) {
    const table = document.getElementById('table');
    table.textContent = null;
    for (let i = 0; i <= period; i++) {
        table.insertRow(i);
        if (i === 0) {
            table.rows[i].classList.add('dotw');
        }
        for (let j = 0; j <= dotw; j++) {
            table.rows[i].insertCell(j);
            if (i === 0 && j != 0) {
                writeSub({ period: i, dotw: j, name: dotws[j], remarks: "" });
            }
            if (j === 0) {
                if (i != 0) {
                    writeSub({ period: i, dotw: j, name: i, remarks: "" });
                }
                table.rows[i].cells[j].classList.add('period');
            }
        }
    }
}

function writeSub(subject) {
    const table = document.getElementById('table');
    table.rows[subject.period].cells[subject.dotw].textContent = null;
    const name = document.createElement('p');
    const remarks = document.createElement('p');
    name.textContent = subject.name;
    name.classList.add('nameSub');
    remarks.textContent = subject.remarks;
    remarks.classList.add('remarksSub');
    table.rows[subject.period].cells[subject.dotw].append(name, remarks);
}

function writeAllSub(data) {
    for (key in data) {
        if (data[key].period <= data.period && data[key].dotw <= data.dotw && data[key].name && data[key].period) {
            writeSub(data[key]);
        }
    }
}


