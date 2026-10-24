//% deprecated=true
namespace huskylens {
}

//% color=#ff6800 icon="\uf25a" block="חיישן מחוות"
namespace paj7620 {
    const PAJ7620_I2C_ADDR = 0x73; // כתובת ה-I2C של חיישן המחושים

    // בחירת בנק זיכרון
    const PAJ7620_REGITER_BANK_SEL = 0xEF;
    const PAJ7620_BANK0 = 0x00;
    const PAJ7620_BANK1 = 0x01;

    // קודי זיהוי תנועות מתוך רגיסטרי החיישן
    const GES_UP = 0x01;
    const GES_DOWN = 0x02;
    const GES_LEFT = 0x04;
    const GES_RIGHT = 0x08;
    const GES_FORWARD = 0x10;
    const GES_BACKWARD = 0x20;
    const GES_CLOCKWISE = 0x40;
    const GES_COUNT_CLOCKWISE = 0x80;
    const GES_WAVE = 0x100;

    function writeReg(addr: number, val: number) {
        let buf = pins.createBuffer(2);
        buf[0] = addr;
        buf[1] = val;
        pins.i2cWriteBuffer(PAJ7620_I2C_ADDR, buf);
    }

    function readReg(addr: number): number {
        pins.i2cWriteNumber(PAJ7620_I2C_ADDR, addr, NumberFormat.UInt8BE, false);
        return pins.i2cReadNumber(PAJ7620_I2C_ADDR, NumberFormat.UInt8BE, false);
    }

    /**
     * אתחול חיישן המחושים PAJ7620
     */
    //% block="אתחל חיישן מחושים PAJ7620"
    //% weight=100
    export function init(): void {
        writeReg(PAJ7620_REGITER_BANK_SEL, PAJ7620_BANK0);
        basic.pause(50);
    }

    /**
     * מחזיר את סוג התנועה האחרונה שזוהתה באוויר
     */
    //% block="תנועה שזוהתה בחיישן המחושים"
    //% weight=90
    export function getGesture(): GestureType {
        writeReg(PAJ7620_REGITER_BANK_SEL, PAJ7620_BANK0);
        let data = readReg(0x43);
        let data2 = readReg(0x44);

        let val = data | (data2 << 8);

        if (val == GES_UP) return GestureType.Up;
        if (val == GES_DOWN) return GestureType.Down;
        if (val == GES_LEFT) return GestureType.Left;
        if (val == GES_RIGHT) return GestureType.Right;
        if (val == GES_FORWARD) return GestureType.Forward;
        if (val == GES_BACKWARD) return GestureType.Backward;
        if (val == GES_CLOCKWISE) return GestureType.Clockwise;
        if (val == GES_COUNT_CLOCKWISE) return GestureType.CounterClockwise;
        if (val == GES_WAVE) return GestureType.Wave;

        return GestureType.None;
    }

    /**
     * בודק האם תנועה ספציפית זוהתה כרגע (מחזיר אמת או שקר)
     * @param gesture סוג התנועה לבדיקה
     */
    //% block="האם זוהתה תנועה %gesture"
    //% weight=85
    export function isGesture(gesture: GestureType): boolean {
        return getGesture() === gesture;
    }

    export enum GestureType {
        //% block="ללא"
        None = 0,
        //% block="למעלה"
        Up = 1,
        //% block="למטה"
        Down = 2,
        //% block="שמאלה"
        Left = 3,
        //% block="ימינה"
        Right = 4,
        //% block="קדימה"
        Forward = 5,
        //% block="אחורה"
        Backward = 6,
        //% block="בכיוון השעון"
        Clockwise = 7,
        //% block="נגד כיוון השעון"
        CounterClockwise = 8,
        //% block="נפנוף"
        Wave = 9
    }
}

//% color=#0fbc11 icon="\uf0cb" block="חיישן קו"
namespace yahboomTracker {
    const MODULE_ADDRESS = 0x12; // כתובת ה-I2C של המודול[cite: 1]
    const REG_ADDRESS = 0x30;    // רגיסטר לקריאה דיגיטלית[cite: 1]

    /**
     * מחזיר אמת אם כל החיישנים שדולקים יוצרים רצף אחיד וצמוד ללא פערים, ושקר אם יש הפרשים או נתקים.
     */
    //% block="האם החיישנים הדלוקים צמודים ברצף?"
    //% weight=30
    export function isContinuousLine(): boolean {
        let data = readRawData();
        if (data === 0) return false;

        let first = -1;
        let last = -1;
        let activeCount = 0;

        for (let i = 0; i < 8; i++) {
            let val = (data >> (7 - i)) & 0x01;
            if (val === 1) {
                if (first === -1) {
                    first = i;
                }
                last = i;
                activeCount++;
            }
        }

        let expectedCount = (last - first) + 1;
        return activeCount === expectedCount;
    }

    /**
     * מחשב את מרכז הקו (ממוצע מיקומי החיישנים הפעילים). 
     * לדוגמה, אם חיישנים 6, 7 ו-8 רואים קו, יחזיר את המספר 7. אם אין קו, יחזיר 0.
     */
    //% block="מרכז הקו"
    //% weight=40
    export function getLineCenter(): number {
        let data = readRawData();
        let sumIndex = 0;
        let count = 0;

        for (let i = 1; i <= 8; i++) {
            let val = (data >> (8 - i)) & 0x01;
            if (val === 1) {
                sumIndex += i;
                count++;
            }
        }

        if (count === 0) {
            return 0; // אין קו
        }
        return Math.round(sumIndex / count);
    }

    /**
     * מחזיר אמת (True) אם הרובוט מזהה קו בכלל, או שקר (False) אם איבד את הקו
     */
    //% block="האם זוהה קו?"
    //% weight=60
    export function isLineDetected(): boolean {
        return readRawData() > 0;
    }

    /**
     * בודק כמה חיישנים מתוך ה-8 רואים קו כרגע (מחזיר מספר בין 0 ל-8)
     */
    //% block="כמות החיישנים שרואים קו"
    //% weight=50
    export function countActiveSensors(): number {
        let data = readRawData();
        let count = 0;
        for (let i = 0; i < 8; i++) {
            if ((data >> i) & 0x01) {
                count++;
            }
        }
        return count;
    }

    /**
     * מדפיס בצורה מסודרת בעברית למוניטור הטורי את מצב כל 8 החיישנים
     */
    //% block="הצג את מצב החיישנים"
    //% weight=90
    export function printStatusSerial(): void {
        let data = readRawData();
        let text = "מצב חיישנים (1-8): ";
        for (let i = 1; i <= 8; i++) {
            let val = (data >> (8 - i)) & 0x01;
            text += "ח" + i + ":" + val + " ";
        }
        serial.writeLine(text);
    }

    /**
     * קרא את כל 8 החיישנים כבית בינארי שלם (0 עד 255)
     */

    export function readRawData(): number {
        pins.i2cWriteNumber(
            MODULE_ADDRESS,
            REG_ADDRESS,
            NumberFormat.UInt8BE,
            false
        );
        basic.pause(10); // השהייה הנדרשת לפי מפרט היצרן[cite: 1]
        let buf = pins.i2cReadBuffer(MODULE_ADDRESS, 1, false);
        return buf[0];
    }

    /**
     * מחזיר אמת אם חיישן ספציפי רואה קו, ושקר אם לא (בלוק בוליאני לתנאים).
     * @param ch מספר החיישן בין 1 ל-8
     */
    //% block="האם חיישן מס' %ch רואה קו?"
    //% ch.min=1 ch.max=8 ch.defl=1
    //% weight=70
    export function isSensorActive(ch: number): boolean {
        return readChannel(ch) === 1;
    }

    /**
     * קרא את המצב של חיישן ספציפי (1 עד 8). מחזיר 0 (לבן) או 1 (שחור/קו).
     * @param ch מספר החיישן בין 1 ל-8
     */
    //% block="קרא חיישן מס' %ch (1-8)"
    //% ch.min=1 ch.max=8 ch.defl=1
    //% weight=80
    export function readChannel(ch: number): number {
        let data = readRawData();
        if (ch < 1) ch = 1;
        if (ch > 8) ch = 8;
        let shift = 8 - ch;
        return (data >> shift) & 0x01;
    }
}

/**
 * ספריית מעטפת מלאה בעברית למצלמת HuskyLens
 */
//% color="#2980b9" icon="\uf06e" block="מצלמת האסקי"
namespace huskylensHebrew {

    export enum AlgorithmMode {
        //% block="זיהוי פנים"
        FaceRecognition = protocolAlgorithm.ALGORITHM_FACE_RECOGNITION,
        //% block="מעקב אחר עצם"
        ObjectTracking = protocolAlgorithm.ALGORITHM_OBJECT_TRACKING,
        //% block="זיהוי עצמים"
        ObjectRecognition = protocolAlgorithm.ALGORITHM_OBJECT_RECOGNITION,
        //% block="מעקב אחר קו"
        LineTracking = protocolAlgorithm.ALGORITHM_LINE_TRACKING,
        //% block="זיהוי צבעים"
        ColorRecognition = protocolAlgorithm.ALGORITHM_COLOR_RECOGNITION,
        //% block="זיהוי תגיות (QR)"
        TagRecognition = protocolAlgorithm.ALGORITHM_TAG_RECOGNITION
    }

    export enum TargetProperty {
        //% block="מרכז X"
        XCenter = Content1.xCenter,
        //% block="מרכז Y"
        YCenter = Content1.yCenter,
        //% block="רוחב"
        Width = Content1.width,
        //% block="גובה"
        Height = Content1.height
    }

    export enum ArrowProperty {
        //% block="התחלה X"
        XOrigin = Content2.xOrigin,
        //% block="התחלה Y"
        YOrigin = Content2.yOrigin,
        //% block="סיום X"
        XTarget = Content2.xTarget,
        //% block="סיום Y"
        YTarget = Content2.yTarget
    }

    export enum ResultType {
        //% block="מסגרת"
        Frame = HUSKYLENSResultType_t.HUSKYLENSResultBlock,
        //% block="חץ"
        Arrow = HUSKYLENSResultType_t.HUSKYLENSResultArrow
    }

    // ==========================================
    // בלוקים ראשיים
    // ==========================================

    //% block="אתחל תקשורת עם מצלמת האסקי"
    //% weight=100
    export function initI2C(): void {
        huskylens.initI2c();
    }

    //% block="החלף מצב אלגוריתם ל- %mode"
    //% weight=95
    export function switchAlgorithm(mode: AlgorithmMode): void {
        huskylens.initMode(mode as any as protocolAlgorithm);
    }

    //% block="בקש נתונים פעם אחת ושמור בזיכרון"
    //% weight=90
    export function requestData(): void {
        huskylens.request();
    }

    //% block="כמות המטרות שנלמדו בסך הכל"
    //% weight=88
    export function getLearnedIDsCount(): number {
        return huskylens.getIds();
    }

    //% block="האם %ht מופיע על המסך?"
    //% weight=86
    export function isTypeOnScreen(ht: ResultType): boolean {
        return huskylens.isAppear_s(ht as any as HUSKYLENSResultType_t);
    }

    //% block="מחץ הקרוב ביותר למרכז המסך קבל את %prop"
    //% weight=84
    export function getCenterArrowData(prop: ArrowProperty): number {
        return huskylens.readArrow_s(prop as any as Content4);
    }

    //% block="ממסגרת הקרובה ביותר למרכז המסך קבל את %prop"
    //% weight=82
    export function getCenterBoxData(prop: TargetProperty): number {
        return huskylens.readBox_s(prop as any as Content3);
    }

    //% block="האם מטרה בעלת מספר %id נלמדה במצלמה?"
    //% id.defl=1
    //% weight=80
    export function isLearned(id: number): boolean {
        return huskylens.isLearned(id);
    }

    //% block="האם %ht של מטרה מס' %id מופיע על המסך?"
    //% id.defl=1
    //% weight=78
    export function isIdOnScreen(id: number, ht: ResultType): boolean {
        return huskylens.isAppear(id, ht as any as HUSKYLENSResultType_t);
    }

    //% block="ממסגרת של מטרה מס' %id קבל את %prop"
    //% id.defl=1
    //% weight=76
    export function getBoxDataByID(id: number, prop: TargetProperty): number {
        return huskylens.readeBox(id, prop as any as Content1);
    }

    //% block="מחץ של מטרה מס' %id קבל את %prop"
    //% id.defl=1
    //% weight=74
    export function getArrowDataByID(id: number, prop: ArrowProperty): number {
        return huskylens.readeArrow(id, prop as any as Content2);
    }

    // ==========================================
    // בלוקים מתקדמים - לשונית "עוד"
    // ==========================================

    //% subcategory="עוד"
    //% block="סך הכל פריטי %ht שמופיעים כרגע"
    //% weight=70
    export function getTotalCount(ht: ResultType): number {
        return huskylens.getBox(ht as any as HUSKYLENSResultType_t);
    }

    //% subcategory="עוד"
    //% block="מחץ מס' %index שעל המסך קבל את %prop"
    //% index.defl=1
    //% weight=68
    export function getArrowDataByIndex(index: number, prop: ArrowProperty): number {
        return huskylens.readArrow_ss(index, prop as any as Content4);

    }

    //% subcategory="עוד"
    //% block="ממסגרת מס' %index שעל המסך קבל את %prop"
    //% index.defl=1
    //% weight=66
    export function getBoxDataByIndex(index: number, prop: TargetProperty): number {
        return huskylens.readBox_ss(index, prop as any as Content3);
    }

    //% subcategory="עוד"
    //% block="כמות פריטי %ht של מטרה מס' %id שמופיעים כרגע"
    //% id.defl=1
    //% weight=64
    export function getCountByID(id: number, ht: ResultType): number {
        return huskylens.getBox_S(id, ht as any as HUSKYLENSResultType_t);
    }

    //% subcategory="עוד"
    //% block="ממסגרת מס' %index של מטרה מס' %id קבל את %prop"
    //% id.defl=1 index.defl=1
    //% weight=62
    export function getBoxDataByIndexAndID(id: number, index: number, prop: TargetProperty): number {
        return huskylens.readeBox_index(id, index, prop as any as Content1);
    }

    //% subcategory="עוד"
    //% block="מחץ מס' %index של מטרה מס' %id קבל את %prop"
    //% id.defl=1 index.defl=1
    //% weight=60
    export function getArrowDataByIndexAndID(id: number, index: number, prop: ArrowProperty): number {
        return huskylens.readeArrow_index(id, index, prop as any as Content2);
    }

    //% subcategory="עוד"
    //% block="למד אוטומטית פעם אחת מטרה מס' %id"
    //% id.defl=1
    //% weight=58
    export function learnOnce(id: number): void {
        huskylens.writeLearn1(id);
    }

    //% subcategory="עוד"
    //% block="שכח את כל המטרות שנלמדו באלגוריתם הנוכחי"
    //% weight=56
    export function forgetAll(): void {
        huskylens.forgetLearn();
    }

    //% subcategory="עוד"
    //% block="שנה שם של מטרה מס' %id לשם %name"
    //% id.defl=1 name.defl="רובוט"
    //% weight=54
    export function setIDName(id: number, name: string): void {
        huskylens.writeName(id, name);
    }

    //% subcategory="עוד"
    //% block="הצג כיתוב על המסך %text במיקומים אופקי: %x אנכי: %y"
    //% x.defl=150 y.defl=30
    //% weight=52
    export function showCustomText(text: string, x: number, y: number): void {
        huskylens.writeOSD(text, x, y);
    }

    //% subcategory="עוד"
    //% block="נקה את כל הכיתובים ממסך המצלמה"
    //% weight=50
    export function clearCustomTexts(): void {
        huskylens.clearOSD();
    }

    //% subcategory="עוד"
    //% block="צלם תמונה ושמור בכרטיס הזיכרון"
    //% weight=48
    export function savePhotoToSD(): void {
        huskylensHebrew.savePhotoToSD()    
    }

    //% subcategory="עוד"
    //% block="שמור צילום מסך בכרטיס הזיכרון"
    //% weight=46
    export function saveScreenshotToSD(): void {
        huskylensHebrew.saveScreenshotToSD()
    }
}