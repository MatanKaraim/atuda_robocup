//% subcategory="ספריות מקוריות"
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
 * ספריית מעטפת בעברית למצלמת HuskyLens
 */
//% color="#2980b9" icon="\uf06e" block="מצלמה"
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

    /**
     * אתחול המצלמה בתקשורת I2C
     */
    //% block="אתחל מצלמת האסקי"
    //% weight=100
    export function init(): void {
        huskylens.initI2c();
    }

    /**
     * קביעת מצב הפעולה / האלגוריתם של המצלמה
     * @param mode מצב הפעולה שנבחר
     */
    //% block="הגדר מצב מצלמה ל- %mode"
    //% weight=95
    export function setMode(mode: AlgorithmMode): void {
        // המרת טיפוס כדי למנוע את שגיאה 291
        huskylens.initMode(mode as any as protocolAlgorithm);
    }

    /**
     * בקשת נתונים עדכניים מהמצלמה (חובה לשים בתוך בלולאת 'לעולמים')
     */
    //% block="עדכן נתונים מהמצלמה"
    //% weight=90
    export function requestData(): void {
        huskylens.request();
    }

    /**
     * בדיקה האם מטרה ספציפית נלמדה במצלמה
     * @param id מזהה המטרה (ID)
     */
    //% block="האם מטרה %id נלמדה במצלמה?"
    //% id.defl=1
    //% weight=85
    export function isLearned(id: number): boolean {
        return huskylens.isLearned(id);
    }

    /**
     * בדיקה האם מטרה ספציפית מופיעה כרגע על המסך
     * @param id מזהה המטרה (ID)
     */
    //% block="האם מטרה %id מופיעה על המסך?"
    //% id.defl=1
    //% weight=80
    export function isTargetVisible(id: number): boolean {
        return huskylens.isAppear(id, HUSKYLENSResultType_t.HUSKYLENSResultBlock);
    }

    /**
     * קריאת ערך מיקום/גודל של מטרה מסוימת לפי ה-ID שלה
     * @param id מזהה המטרה
     * @param prop המאפיין המבוקש (X, Y, רוחב, גובה)
     */
    //% block="קבל ממטרה %id את %prop"
    //% id.defl=1
    //% weight=75
    export function readTargetProperty(id: number, prop: TargetProperty): number {
        // המרת טיפוס כדי למנוע את שגיאה 334
        return huskylens.readeBox(id, prop as any as Content1);
    }

    /**
     * קריאת מספר ה-ID של העצם שנמצא במרכז המסך
     */
    //% block="מספר העצם במרכז המסך"
    //% weight=70
    export function getCenterBoxID(): number {
        return huskylens.readBox_s(Content3.ID);
    }

    /**
     * קריאת מספר ה-ID של המטרה ה-N מתוך רשימת המטרות שנראות כרגע
     * @param index מספר המטרה (אינדקס 1 ומעלה)
     */
    //% block="מספר הזיהוי של העצם ה-%index שנראה כרגע"
    //% index.defl=1
    //% weight=65
    export function getNthBoxID(index: number): number {
        return huskylens.readBox_ss(index, Content3.ID);
    }
}