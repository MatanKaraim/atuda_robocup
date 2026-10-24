//% advanced=true
namespace huskylens {
}

/**
 * ספריית חיישן מחוות PAJ7620U2
 */
//% color=#ff6800 icon="\uf25a" block="חיישן מחוות"
namespace paj7620 {
    const PAJ7620_I2C_ADDR = 0x73;
    const PAJ7620_REGISTER_BANK_SEL = 0xEF;
    const PAJ7620_BANK0 = 0x00;
    const PAJ7620_BANK1 = 0x01;

    // מערך אתחול רגיסטרים מלא מחומרת DFRobot PAJ7620U2
    const INIT_ARRAY: number[][] = [
        [0xEF, 0x00], [0x32, 0x29], [0x33, 0x01], [0x34, 0x00], [0x35, 0x01],
        [0x36, 0x00], [0x37, 0x07], [0x38, 0x17], [0x39, 0x06], [0x3A, 0x12],
        [0x3F, 0x00], [0x40, 0x00], [0x41, 0xFF], [0x42, 0x01], [0x46, 0x2D],
        [0x47, 0x0F], [0x48, 0x3C], [0x49, 0x00], [0x4A, 0x1E], [0x4C, 0x20],
        [0x4D, 0x00], [0x4E, 0x1A], [0x4F, 0x14], [0x50, 0x3F], [0x51, 0x3F],
        [0x52, 0x00], [0x54, 0x00], [0x55, 0xC7], [0x56, 0x01], [0x57, 0x12],
        [0x58, 0x05], [0x59, 0x05], [0x5A, 0x02], [0x5B, 0x03], [0x5C, 0x08],
        [0x5D, 0x0A], [0x5E, 0x03], [0x5F, 0x21], [0x60, 0x0F], [0x61, 0x0A],
        [0x62, 0x05], [0x63, 0x14], [0x65, 0x0B], [0x66, 0x0B], [0x67, 0x05],
        [0x68, 0x05], [0x69, 0x05], [0x6A, 0x02], [0x6B, 0x08], [0x6C, 0x04],
        [0x6D, 0x20], [0x6E, 0x10], [0x6F, 0x08], [0x70, 0x04], [0x71, 0x0C],
        [0x72, 0x10], [0x73, 0x08], [0x74, 0x07], [0x75, 0x07], [0x77, 0x01],
        [0x81, 0x56], [0x82, 0x04], [0x83, 0x30], [0x84, 0x20], [0x86, 0xA0],
        [0x87, 0x78], [0x88, 0x01], [0x89, 0x55], [0x8A, 0x55], [0x8B, 0x01],
        [0x8C, 0x3C], [0x8D, 0x3C], [0x8E, 0x00], [0x8F, 0x1A], [0x90, 0x40],
        [0x91, 0x00], [0x92, 0x02], [0x93, 0x00], [0x94, 0x04], [0x95, 0x05],
        [0x96, 0x01], [0x97, 0x05], [0x98, 0x05], [0x99, 0x05], [0x9A, 0x14],
        [0x9C, 0x3F], [0x9D, 0x33], [0x9E, 0xAE], [0x9F, 0xF9], [0xA0, 0x48],
        [0xA1, 0x13], [0xA2, 0x10], [0xA3, 0x08], [0xA4, 0x30], [0xA5, 0x24],
        [0xA6, 0x14], [0xA7, 0x08], [0xA8, 0x24], [0xA9, 0x1C], [0xAA, 0x0C],
        [0xAB, 0x08], [0xCC, 0x19], [0xCD, 0x0B], [0xCE, 0x13], [0xCF, 0x64],
        [0xD0, 0x21], [0xEF, 0x01], [0x02, 0x0F], [0x03, 0x10], [0x04, 0x02],
        [0x25, 0x01], [0x27, 0x39], [0x28, 0x7F], [0x29, 0x08], [0x3E, 0xFF],
        [0x5E, 0x3D], [0x65, 0x96], [0x67, 0x97], [0x69, 0xCD], [0x6A, 0x01],
        [0x6D, 0x2C], [0x6E, 0x01], [0x72, 0x01], [0x73, 0x35], [0x74, 0x00],
        [0x77, 0x01], [0xEF, 0x00]
    ];

    export enum GestureType {
        //% block="ללא"
        None = 0,
        //% block="ימינה"
        Right = 0x01,
        //% block="שמאלה"
        Left = 0x02,
        //% block="למעלה"
        Up = 0x04,
        //% block="למטה"
        Down = 0x08,
        //% block="קדימה"
        Forward = 0x10,
        //% block="אחורה"
        Backward = 0x20,
        //% block="בכיוון השעון"
        Clockwise = 0x40,
        //% block="נגד כיוון השעון"
        CounterClockwise = 0x80,
        //% block="נפנוף"
        Wave = 0x100
    }

    function writeReg(addr: number, val: number): void {
        let buf = pins.createBuffer(2);
        buf[0] = addr;
        buf[1] = val;
        pins.i2cWriteBuffer(PAJ7620_I2C_ADDR, buf, false);
    }

    function readReg(addr: number): number {
        pins.i2cWriteNumber(PAJ7620_I2C_ADDR, addr, NumberFormat.UInt8BE, true);
        return pins.i2cReadNumber(PAJ7620_I2C_ADDR, NumberFormat.UInt8BE, false);
    }

    /**
     * מאתחל את חיישן המחוות PAJ7620U2
     */
    //% block="אתחל חיישן מחוות PAJ7620"
    //% weight=100
    export function init(): boolean {
        basic.pause(400); // המתנה להתייצבות מתח
        writeReg(PAJ7620_REGISTER_BANK_SEL, PAJ7620_BANK0);

        // בדיקת תקינות רכיב
        let partIdLow = readReg(0x00);
        let partIdHigh = readReg(0x01);
        let partId = (partIdHigh << 8) | partIdLow;
        if (partId !== 0x7620) {
            return false;
        }

        // טעינת מערך הגדרות יצרן
        for (let i = 0; i < INIT_ARRAY.length; i++) {
            writeReg(INIT_ARRAY[i][0], INIT_ARRAY[i][1]);
        }

        writeReg(PAJ7620_REGISTER_BANK_SEL, PAJ7620_BANK0);
        return true;
    }

    /**
     * מחזיר את סוג התנועה שזוהתה
     */
    //% block="תנועה שזוהתה בחיישן המחוות"
    //% weight=90
    export function getGesture(): GestureType {
        writeReg(PAJ7620_REGISTER_BANK_SEL, PAJ7620_BANK0);
        let flag0 = readReg(0x43);
        let flag1 = readReg(0x44);
        let val = flag0 | (flag1 << 8);

        if (val & GestureType.Right) return GestureType.Right;
        if (val & GestureType.Left) return GestureType.Left;
        if (val & GestureType.Up) return GestureType.Up;
        if (val & GestureType.Down) return GestureType.Down;
        if (val & GestureType.Forward) return GestureType.Forward;
        if (val & GestureType.Backward) return GestureType.Backward;
        if (val & GestureType.Clockwise) return GestureType.Clockwise;
        if (val & GestureType.CounterClockwise) return GestureType.CounterClockwise;
        if (val & GestureType.Wave) return GestureType.Wave;

        return GestureType.None;
    }

    /**
     * בודק האם תנועה מסוימת זוהתה
     * @param gesture סוג התנועה
     */
    //% block="האם זוהתה תנועה %gesture"
    //% weight=85
    export function isGesture(gesture: GestureType): boolean {
        return getGesture() === gesture;
    }
}

/**
 * ספריית חיישן עקיבת קו 8 ערוצים (Yahboom)
 */
//% color=#0fbc11 icon="\uf0cb" block="חיישן קו"
namespace yahboomTracker {
    const MODULE_ADDRESS = 0x12;
    const REG_ADDRESS = 0x30;

    export function readRawData(): number {
        pins.i2cWriteNumber(MODULE_ADDRESS, REG_ADDRESS, NumberFormat.UInt8BE, false);
        basic.pause(10);
        let buf = pins.i2cReadBuffer(MODULE_ADDRESS, 1, false);
        return buf[0];
    }

    /**
     * מחזיר אמת אם כל החיישנים הפעילים צמודים ברצף ללא פערים
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
                if (first === -1) first = i;
                last = i;
                activeCount++;
            }
        }

        let expectedCount = (last - first) + 1;
        return activeCount === expectedCount;
    }

    /**
     * מחשב את ממוצע מיקומי החיישנים הפעילים (1 עד 8, 0 אם אין קו)
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

        if (count === 0) return 0;
        return Math.round(sumIndex / count);
    }

    /**
     * בודק האם זוהה קו כלשהו
     */
    //% block="האם זוהה קו?"
    //% weight=60
    export function isLineDetected(): boolean {
        return readRawData() > 0;
    }

    /**
     * סופר כמה חיישנים מזהים קו כרגע (0 עד 8)
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
     * מדפיס את מצב 8 החיישנים לערוץ הטורי (Serial)
     */
    //% block="הצג את מצב החיישנים במוניטור"
    //% weight=90
    export function printStatusSerial(): void {
        let data = readRawData();
        let text = "Sensors (1-8): ";
        for (let i = 1; i <= 8; i++) {
            let val = (data >> (8 - i)) & 0x01;
            text += "S" + i + ":" + val + " ";
        }
        serial.writeLine(text);
    }

    /**
     * קורא ערך של ערוץ בודד (1 עד 8)
     * @param ch מספר ערוץ
     */
    //% block="קרא חיישן מספר %ch"
    //% ch.min=1 ch.max=8 ch.defl=1
    //% weight=80
    export function readChannel(ch: number): number {
        let data = readRawData();
        ch = Math.clamp(1, 8, ch);
        let shift = 8 - ch;
        return (data >> shift) & 0x01;
    }

    /**
     * בודק האם חיישן מסוים רואה קו (בוליאני)
     * @param ch מספר חיישן
     */
    //% block="האם חיישן מספר %ch רואה קו?"
    //% ch.min=1 ch.max=8 ch.defl=1
    //% weight=70
    export function isSensorActive(ch: number): boolean {
        return readChannel(ch) === 1;
    }
}

/**
 * ספריית מעטפת עברית מלאה למצלמת HuskyLens
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
        //% block="מרכז אופקי (X)"
        XCenter = Content1.xCenter,
        //% block="מרכז אנכי (Y)"
        YCenter = Content1.yCenter,
        //% block="רוחב"
        Width = Content1.width,
        //% block="גובה"
        Height = Content1.height
    }

    export enum ArrowProperty {
        //% block="התחלה אופקית (X)"
        XOrigin = Content2.xOrigin,
        //% block="התחלה אנכית (Y)"
        YOrigin = Content2.yOrigin,
        //% block="סיום אופקי (X)"
        XTarget = Content2.xTarget,
        //% block="סיום אנכי (Y)"
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

    //% group="אתחול והגדרות"
    //% block="אתחל תקשורת עם מצלמת האסקי"
    //% weight=100
    export function initI2C(): void {
        huskylens.initI2c();
    }

    //% group="אתחול והגדרות"
    //% block="החלף מצב אלגוריתם ל %mode"
    //% weight=95
    export function switchAlgorithm(mode: AlgorithmMode): void {
        huskylens.initMode(mode as number as protocolAlgorithm);
    }

    //% group="קריאת נתונים ובדיקות"
    //% block="בקש נתונים פעם אחת ושמור בזיכרון"
    //% weight=90
    export function requestData(): void {
        huskylens.request();
    }

    //% group="קריאת נתונים ובדיקות"
    //% block="כמות המטרות שנלמדו בסך הכל"
    //% weight=88
    export function getLearnedIDsCount(): number {
        return huskylens.getIds();
    }

    //% group="קריאת נתונים ובדיקות"
    //% block="האם %ht מופיע על המסך?"
    //% weight=86
    export function isTypeOnScreen(ht: ResultType): boolean {
        return huskylens.isAppear_s(ht as number as HUSKYLENSResultType_t);
    }

    //% group="עצם במרכז המסך"
    //% block="מחץ הקרוב ביותר למרכז המסך קבל את %prop"
    //% weight=84
    export function getCenterArrowData(prop: ArrowProperty): number {
        return huskylens.readArrow_s(prop as number as Content4);
    }

    //% group="עצם במרכז המסך"
    //% block="ממסגרת הקרובה ביותר למרכז המסך קבל את %prop"
    //% weight=82
    export function getCenterBoxData(prop: TargetProperty): number {
        return huskylens.readBox_s(prop as number as Content3);
    }

    //% group="מידע לפי מספר מטרה"
    //% block="האם מטרה מספר %id נלמדה במצלמה?"
    //% id.defl=1
    //% weight=80
    export function isLearned(id: number): boolean {
        return huskylens.isLearned(id);
    }

    //% group="מידע לפי מספר מטרה"
    //% block="האם %ht של מטרה מספר %id מופיע על המסך?"
    //% id.defl=1
    //% weight=78
    export function isIdOnScreen(id: number, ht: ResultType): boolean {
        return huskylens.isAppear(id, ht as number as HUSKYLENSResultType_t);
    }

    //% group="מידע לפי מספר מטרה"
    //% block="ממסגרת של מטרה מספר %id קבל את %prop"
    //% id.defl=1
    //% weight=76
    export function getBoxDataByID(id: number, prop: TargetProperty): number {
        return huskylens.readeBox(id, prop as number as Content1);
    }

    //% group="מידע לפי מספר מטרה"
    //% block="מחץ של מטרה מספר %id קבל את %prop"
    //% id.defl=1
    //% weight=74
    export function getArrowDataByID(id: number, prop: ArrowProperty): number {
        return huskylens.readeArrow(id, prop as number as Content2);
    }

    // ==========================================
    // בלוקים מתקדמים - לשונית "עוד"
    // ==========================================

    //% subcategory="עוד"
    //% group="ספירה ומיקום לפי סדר"
    //% block="סך הכל פריטי %ht שמופיעים כרגע"
    //% weight=70
    export function getTotalCount(ht: ResultType): number {
        return huskylens.getBox(ht as number as HUSKYLENSResultType_t);
    }

    //% subcategory="עוד"
    //% group="ספירה ומיקום לפי סדר"
    //% block="מחץ מספר %index שעל המסך קבל את %prop"
    //% index.defl=1
    //% weight=68
    export function getArrowDataByIndex(index: number, prop: ArrowProperty): number {
        return huskylens.readArrow_ss(index, prop as number as Content4);
    }

    //% subcategory="עוד"
    //% group="ספירה ומיקום לפי סדר"
    //% block="ממסגרת מספר %index שעל המסך קבל את %prop"
    //% index.defl=1
    //% weight=66
    export function getBoxDataByIndex(index: number, prop: TargetProperty): number {
        return huskylens.readBox_ss(index, prop as number as Content3);
    }

    //% subcategory="עוד"
    //% group="ספירה ומיקום לפי סדר"
    //% block="כמות פריטי %ht של מטרה מספר %id שמופיעים כרגע"
    //% id.defl=1
    //% weight=64
    export function getCountByID(id: number, ht: ResultType): number {
        return huskylens.getBox_S(id, ht as number as HUSKYLENSResultType_t);
    }

    //% subcategory="עוד"
    //% group="ספירה ומיקום לפי סדר"
    //% block="ממסגרת מספר %index של מטרה מספר %id קבל את %prop"
    //% id.defl=1 index.defl=1
    //% weight=62
    export function getBoxDataByIndexAndID(id: number, index: number, prop: TargetProperty): number {
        return huskylens.readeBox_index(id, index, prop as number as Content1);
    }

    //% subcategory="עוד"
    //% group="ספירה ומיקום לפי סדר"
    //% block="מחץ מספר %index של מטרה מספר %id קבל את %prop"
    //% id.defl=1 index.defl=1
    //% weight=60
    export function getArrowDataByIndexAndID(id: number, index: number, prop: ArrowProperty): number {
        return huskylens.readeArrow_index(id, index, prop as number as Content2);
    }

    //% subcategory="עוד"
    //% group="למידה והגדרת שמות"
    //% block="למד אוטומטית פעם אחת מטרה מספר %id"
    //% id.defl=1
    //% weight=58
    export function learnOnce(id: number): void {
        huskylens.writeLearn1(id);
    }

    //% subcategory="עוד"
    //% group="למידה והגדרת שמות"
    //% block="שכח את כל המטרות שנלמדו באלגוריתם הנוכחי"
    //% weight=56
    export function forgetAll(): void {
        huskylens.forgetLearn();
    }

    //% subcategory="עוד"
    //% group="למידה והגדרת שמות"
    //% block="שנה שם של מטרה מספר %id לשם %name"
    //% id.defl=1 name.defl="רובוט"
    //% weight=54
    export function setIDName(id: number, name: string): void {
        huskylens.writeName(id, name);
    }

    //% subcategory="עוד"
    //% group="מסך ותצוגה"
    //% block="הצג כיתוב על המסך %text במיקומים אופקי: %x אנכי: %y"
    //% x.defl=150 y.defl=30
    //% weight=52
    export function showCustomText(text: string, x: number, y: number): void {
        huskylens.writeOSD(text, x, y);
    }

    //% subcategory="עוד"
    //% group="מסך ותצוגה"
    //% block="נקה את כל הכיתובים ממסך המצלמה"
    //% weight=50
    export function clearCustomTexts(): void {
        huskylens.clearOSD();
    }

    //% subcategory="עוד"
    //% group="כרטיס זיכרון"
    //% block="צלם תמונה ושמור בכרטיס הזיכרון"
    //% weight=48
    export function savePhotoToSD(): void {
        huskylens.takePhotoToSDCard(HUSKYLENSphoto.PHOTO);
    }

    //% subcategory="עוד"
    //% group="כרטיס זיכרון"
    //% block="שמור מודל אלגוריתם נוכחי כקובץ מספר %data בכרטיס הזיכרון"
    //% data.defl=0
    //% weight=44
    export function saveModelToSD(data: number): void {
        huskylens.saveModelToTFCard(HUSKYLENSMode.SAVE, data);
    }
}

/**
 * ספריית חיישן צבע TCS34725 מלאה בעברית
 */
//% color="#e67e22" icon="\uf1fc" block="חיישן צבע TCS"
namespace tcsColorSensor {

    const TCS34725_ADDR = 0x29;
    const COMMAND_BIT = 0x80;

    const REG_ENABLE = 0x00;
    const REG_ATIME = 0x01;
    const REG_CONTROL = 0x0F;
    const REG_ID = 0x12;

    const REG_CDATAL = 0x14;
    const REG_RDATAL = 0x16;
    const REG_GDATAL = 0x18;
    const REG_BDATAL = 0x1A;

    export enum TCSChannel {
        //% block="אדום (R)"
        Red,
        //% block="ירוק (G)"
        Green,
        //% block="כחול (B)"
        Blue,
        //% block="שקוף / עוצמת אור (Clear)"
        Clear
    }

    export enum ValueMode {
        //% block="מנורמל (0-255)"
        Normalized,
        //% block="גולמי (RAW)"
        Raw
    }

    export enum TCSGain {
        //% block="1X"
        Gain_1X = 0x00,
        //% block="4X"
        Gain_4X = 0x01,
        //% block="16X"
        Gain_16X = 0x02,
        //% block="60X"
        Gain_60X = 0x03
    }

    export enum TCSTime {
        //% block="2.4ms (מהיר מאוד)"
        Time_2_4ms = 0xFF,
        //% block="24ms"
        Time_24ms = 0xF6,
        //% block="50ms (מומלץ לרובוט)"
        Time_50ms = 0xEB,
        //% block="101ms"
        Time_101ms = 0xD6,
        //% block="154ms (מדויק)"
        Time_154ms = 0xC0
    }

    export enum CustomSlot {
        //% block="צבע מותאם 1"
        Color1 = 0,
        //% block="צבע מותאם 2"
        Color2 = 1,
        //% block="צבע מותאם 3"
        Color3 = 2,
        //% block="צבע מותאם 4"
        Color4 = 3
    }

    export enum ColorTarget {
        //% block="אדום"
        Red,
        //% block="ירוק"
        Green,
        //% block="כחול"
        Blue,
        //% block="צהוב"
        Yellow,
        //% block="לבן"
        White,
        //% block="שחור"
        Black,
        //% block="צבע מותאם 1"
        Custom1,
        //% block="צבע מותאם 2"
        Custom2,
        //% block="צבע מותאם 3"
        Custom3,
        //% block="צבע מותאם 4"
        Custom4
    }

    export enum DetectedColorName {
        //% block="אדום"
        Red,
        //% block="ירוק"
        Green,
        //% block="כחול"
        Blue,
        //% block="צהוב"
        Yellow,
        //% block="לבן"
        White,
        //% block="שחור"
        Black,
        //% block="צבע מותאם 1"
        Custom1,
        //% block="צבע מותאם 2"
        Custom2,
        //% block="צבע מותאם 3"
        Custom3,
        //% block="צבע מותאם 4"
        Custom4,
        //% block="לא ידוע"
        Unknown
    }

    class CalibratedColor {
        r: number;
        g: number;
        b: number;
        threshold: number;
        isSet: boolean;
        constructor() {
            this.r = 0;
            this.g = 0;
            this.b = 0;
            this.threshold = 30;
            this.isSet = false;
        }
    }

    let savedSlots: CalibratedColor[] = [
        new CalibratedColor(),
        new CalibratedColor(),
        new CalibratedColor(),
        new CalibratedColor()
    ];

    let ledPin: DigitalPin = DigitalPin.P0;
    let hasLedConfigured = false;

    function write8(reg: number, val: number): void {
        let buf = pins.createBuffer(2);
        buf[0] = COMMAND_BIT | reg;
        buf[1] = val;
        pins.i2cWriteBuffer(TCS34725_ADDR, buf, false);
    }

    function read16(reg: number): number {
        pins.i2cWriteNumber(TCS34725_ADDR, COMMAND_BIT | reg, NumberFormat.UInt8BE, true);
        let buf = pins.i2cReadBuffer(TCS34725_ADDR, 2, false);
        return buf[0] | (buf[1] << 8);
    }

    // ==========================================
    // אתחול, הגדרות חומרה ושליטה בלד
    // ==========================================

    /**
     * מאתחל את רכיב חיישן הצבע TCS34725
     */
    //% group="אתחול והגדרות"
    //% block="אתחל חיישן צבע TCS"
    //% weight=100
    export function init(): boolean {
        pins.i2cWriteNumber(TCS34725_ADDR, COMMAND_BIT | REG_ID, NumberFormat.UInt8BE, true);
        let id = pins.i2cReadNumber(TCS34725_ADDR, NumberFormat.UInt8BE, false);
        if (id != 0x44 && id != 0x4D) {
            return false;
        }

        // הגדרת ברירת מחדל: זמן דגימה 50ms, הגבר 4X
        write8(REG_ATIME, TCSTime.Time_50ms);
        write8(REG_CONTROL, TCSGain.Gain_4X);

        // הפעלת מתנד ורכיב מדידה (PON | AEN)
        write8(REG_ENABLE, 0x01 | 0x02);
        basic.pause(50);

        return true;
    }

    /**
     * מגדיר את הפין אליו מחובר הלד ומדליק אותו
     * @param pin מספר הפין
     */
    //% group="אתחול והגדרות"
    //% block="הגדר פין לד %pin והדלק"
    //% pin.defl=DigitalPin.P0
    //% weight=98
    export function setupLedPin(pin: DigitalPin): void {
        ledPin = pin;
        hasLedConfigured = true;
        pins.digitalWritePin(ledPin, 1);
    }

    /**
     * קובע מצב דולק או כבוי ללד
     * @param on דלוק / כבוי
     */
    //% group="אתחול והגדרות"
    //% block="קבע לד חיישן צבע ל- %on"
    //% on.shadow="toggleOnOff"
    //% weight=96
    export function setLed(on: boolean): void {
        if (hasLedConfigured) {
            pins.digitalWritePin(ledPin, on ? 1 : 0);
        }
    }

    /**
     * כוון את רגישות החיישן (הגבר)
     * @param gain רמת ההגבר
     */
    //% group="אתחול והגדרות"
    //% block="כוון רגישות (הגבר) ל- %gain"
    //% weight=94
    export function setGain(gain: TCSGain): void {
        write8(REG_CONTROL, gain);
    }

    /**
     * כוון את זמן דגימת הנתונים של החיישן
     * @param time משך הדגימה
     */
    //% group="אתחול והגדרות"
    //% block="כוון זמן דגימה ל- %time"
    //% weight=92
    export function setIntegrationTime(time: TCSTime): void {
        write8(REG_ATIME, time);
    }

    // ==========================================
    // קריאת נתונים ותצוגה
    // ==========================================

    /**
     * קורא ערך מספרי עבור ערוץ צבע ספציפי (R, G, B או Clear)
     * @param channel הערוץ לקריאה
     * @param mode מצב ערך: מנורמל (0-255) או גולמי (RAW)
     */
    //% group="קריאת ערכים"
    //% block="קרא ערוץ %channel בערך %mode"
    //% weight=90
    export function getChannelValue(channel: TCSChannel, mode: ValueMode): number {
        let raw = 0;
        switch (channel) {
            case TCSChannel.Red: raw = read16(REG_RDATAL); break;
            case TCSChannel.Green: raw = read16(REG_GDATAL); break;
            case TCSChannel.Blue: raw = read16(REG_BDATAL); break;
            case TCSChannel.Clear: raw = read16(REG_CDATAL); break;
        }

        if (mode === ValueMode.Raw) {
            return raw;
        }

        let c = read16(REG_CDATAL);
        if (c === 0) return 0;
        if (channel === TCSChannel.Clear) return Math.min(255, c);

        return Math.min(255, Math.round((raw / c) * 255));
    }

    /**
     * מחזיר את עוצמת האור הכללית מהחיישן (ערך ערוץ ה-Clear)
     */
    //% group="קריאת ערכים"
    //% block="עוצמת אור כללית (Clear)"
    //% weight=88
    export function getLightIntensity(): number {
        return read16(REG_CDATAL);
    }

    /**
     * מדפיס למוניטור הטורי (Serial) את ערכי הצבע המנורמלים (0-255)
     */
    //% group="מוניטור טורי"
    //% block="הדפס למוניטור ערכים מנורמלים (0-255)"
    //% weight=86
    export function printNormalizedSerial(): void {
        let r = getChannelValue(TCSChannel.Red, ValueMode.Normalized);
        let g = getChannelValue(TCSChannel.Green, ValueMode.Normalized);
        let b = getChannelValue(TCSChannel.Blue, ValueMode.Normalized);
        let c = getChannelValue(TCSChannel.Clear, ValueMode.Normalized);
        serial.writeLine("TCS [Norm] -> R: " + r + " | G: " + g + " | B: " + b + " | Clear: " + c);
    }

    /**
     * מדפיס למוניטור הטורי (Serial) את ערכי הצבע הגולמיים (RAW)
     */
    //% group="מוניטור טורי"
    //% block="הדפס למוניטור ערכים גולמיים (RAW)"
    //% weight=84
    export function printRawSerial(): void {
        let r = getChannelValue(TCSChannel.Red, ValueMode.Raw);
        let g = getChannelValue(TCSChannel.Green, ValueMode.Raw);
        let b = getChannelValue(TCSChannel.Blue, ValueMode.Raw);
        let c = getChannelValue(TCSChannel.Clear, ValueMode.Raw);
        serial.writeLine("TCS [RAW]  -> R: " + r + " | G: " + g + " | B: " + b + " | Clear: " + c);
    }

    // ==========================================
    // כיול וזיהוי צבעים
    // ==========================================

    /**
     * דוגם את המשטח הנוכחי ושומר אותו עם טווח סטייה (Threshold) מותאם אישית
     * @param slot משבצת הצבע לשמירה
     * @param threshold טווח הסטייה המותר לזיהוי (מומלץ 15-45)
     */
    //% group="כיול וזיהוי צבעים"
    //% block="דגום ושמור צבע %slot עם טווח סטייה %threshold"
    //% threshold.defl=30
    //% threshold.min=1 threshold.max=150
    //% weight=82
    export function calibrateCustomColor(slot: CustomSlot, threshold: number): void {
        let r = getChannelValue(TCSChannel.Red, ValueMode.Normalized);
        let g = getChannelValue(TCSChannel.Green, ValueMode.Normalized);
        let b = getChannelValue(TCSChannel.Blue, ValueMode.Normalized);

        savedSlots[slot].r = r;
        savedSlots[slot].g = g;
        savedSlots[slot].b = b;
        savedSlots[slot].threshold = threshold;
        savedSlots[slot].isSet = true;
    }

    function checkSlotMatch(slotIdx: number, r: number, g: number, b: number): boolean {
        let s = savedSlots[slotIdx];
        if (!s.isSet) return false;
        let dr = r - s.r;
        let dg = g - s.g;
        let db = b - s.b;
        let dist = Math.sqrt(dr * dr + dg * dg + db * db);
        return dist <= s.threshold;
    }

    /**
     * בודק האם המשטח הנוכחי תואם לצבע מסוים
     * @param target הצבע לבדיקה (מובנה או שמור)
     */
    //% group="כיול וזיהוי צבעים"
    //% block="האם מזוהה צבע %target ?"
    //% weight=80
    export function isColor(target: ColorTarget): boolean {
        let r = getChannelValue(TCSChannel.Red, ValueMode.Normalized);
        let g = getChannelValue(TCSChannel.Green, ValueMode.Normalized);
        let b = getChannelValue(TCSChannel.Blue, ValueMode.Normalized);
        let c = read16(REG_CDATAL);

        // בדיקה עבור צבעים מכוילים
        if (target === ColorTarget.Custom1) return checkSlotMatch(0, r, g, b);
        if (target === ColorTarget.Custom2) return checkSlotMatch(1, r, g, b);
        if (target === ColorTarget.Custom3) return checkSlotMatch(2, r, g, b);
        if (target === ColorTarget.Custom4) return checkSlotMatch(3, r, g, b);

        // שחור ולבן מבוססים על סך האור ופרופורציות
        if (target === ColorTarget.Black) {
            return c < 80;
        }
        if (target === ColorTarget.White) {
            return c > 600 && Math.abs(r - g) < 25 && Math.abs(g - b) < 25;
        }

        // זיהוי צבעי יסוד לפי דומיננטיות הערוצים
        if (target === ColorTarget.Red) {
            return r > g * 1.3 && r > b * 1.3;
        }
        if (target === ColorTarget.Green) {
            return g > r * 1.2 && g > b * 1.1;
        }
        if (target === ColorTarget.Blue) {
            return b > r * 1.3 && b > g * 1.1;
        }
        if (target === ColorTarget.Yellow) {
            return r > b * 1.4 && g > b * 1.4 && Math.abs(r - g) < 40;
        }

        return false;
    }

    /**
     * מחזיר את שם הצבע שזוהה כרגע מתוך רשימת הצבעים (כולל מותאמים אישית)
     */
    //% group="כיול וזיהוי צבעים"
    //% block="צבע שזוהה"
    //% weight=78
    export function getDetectedColor(): DetectedColorName {
        let r = getChannelValue(TCSChannel.Red, ValueMode.Normalized);
        let g = getChannelValue(TCSChannel.Green, ValueMode.Normalized);
        let b = getChannelValue(TCSChannel.Blue, ValueMode.Normalized);

        // עדיפות ראשונה: צבעים מותאמים אישית שנשמרו בכיול
        if (checkSlotMatch(0, r, g, b)) return DetectedColorName.Custom1;
        if (checkSlotMatch(1, r, g, b)) return DetectedColorName.Custom2;
        if (checkSlotMatch(2, r, g, b)) return DetectedColorName.Custom3;
        if (checkSlotMatch(3, r, g, b)) return DetectedColorName.Custom4;

        // עדיפות שנייה: צבעי בסיס
        if (isColor(ColorTarget.Black)) return DetectedColorName.Black;
        if (isColor(ColorTarget.White)) return DetectedColorName.White;
        if (isColor(ColorTarget.Red)) return DetectedColorName.Red;
        if (isColor(ColorTarget.Green)) return DetectedColorName.Green;
        if (isColor(ColorTarget.Blue)) return DetectedColorName.Blue;
        if (isColor(ColorTarget.Yellow)) return DetectedColorName.Yellow;

        return DetectedColorName.Unknown;
    }
}