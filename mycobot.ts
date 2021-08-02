
//% weight=5 color=#004B7A icon="\uf085"
//% groups='["Basic", "Advance"]'
namespace myCobot {
    export enum SERVO {
        //% block="#1"
        S1 = 1,
        //% block="#2"
        S2 = 2,
        //% block="#3"
        S3 = 3,
        //% block="#4"
        S4 = 4,
        //% block="#5"
        S5 = 5,
        //% block="#6"
        S6 = 6,
    }
    
    export enum COORD {
        //% block="X"
        CX = 1,
        //% block="Y"
        CY = 2,
        //% block="Z"
        CZ = 3,
        //% block="RX"
        CRX = 4,
        //% block="RY"
        CRY = 5,
        //% block="RZ"
        CRZ = 6,
    }
    
    export enum DIR {
        //% block="Positive"
        DP = 0,
        //% block="Negative"
        DN = 1,
    }
    
    export enum ONOFF {
        //% block="ON"
        ON = 0,
        //% block="OFF"
        OFF = 1,
    }
    
    export enum OPENCLOSE {
        //% block="OPEN"
        OPEN = 0,
        //% block="CLOSE"
        CLOSE = 1,
    }
    
    let cmd = null;
    
    function myCobotBasicIo(io:number, state:number): void {
        cmd = pins.createBuffer(7);
        cmd[0] = 0xFE;
        cmd[1] = 0xFE;
        cmd[2] = 0x04;
        cmd[3] = 0xa0;  // r0
        cmd[4] = io;
        cmd[5] = state;
        cmd[6] = 0xFA;
        serial.writeBuffer(cmd);
    }
    
    //% blockId=devInit block="[myCobot] Initialization Use Serial: TX= |%tx|, RX= |%rx|"
    //% blockExternalInputs=1
    //% tx.fieldEditor="gridpicker" tx.fieldOptions.columns=3
    //% tx.fieldOptions.tooltips="false"
    //% rx.fieldEditor="gridpicker" rx.fieldOptions.columns=3
    //% rx.fieldOptions.tooltips="false"
    //% inlineInputMode=inline
    //% weight=95
    //% group="Basic"
    export function devInit(tx:SerialPin, rx:SerialPin): void {
        basic.pause(2000);
        serial.redirect(tx, rx, BaudRate.BaudRate115200);
        basic.pause(100);
        serial.setTxBufferSize(64);
        serial.setRxBufferSize(128);
        serial.readBuffer(0);
        cmd = pins.createBuffer(5);
        cmd[0] = 0xFE;
        cmd[1] = 0xFE;
        cmd[2] = 0x02;
        cmd[3] = 0x10;  // r0
        cmd[4] = 0xFA;
        serial.writeBuffer(cmd);
        basic.pause(100);
        myCobot.setPumpMode(ONOFF.OFF);
        serial.readBuffer(0);
    }
    
    //% blockId=getEndCoord block="[myCobot] Coordinate |%coord| Of The End"
    //% weight=85
    //% group="Basic"
    export function getEndCoord(coord:COORD): number {
        serial.readBuffer(0);
        cmd = pins.createBuffer(5);
        cmd[0] = 0xFE;
        cmd[1] = 0xFE;
        cmd[2] = 0x02;
        cmd[3] = 0x23;  // r96+17
        cmd[4] = 0xFA;
        serial.writeBuffer(cmd);
        let res = serial.readBuffer(113);        
        let mul = 10.0;
        let val = res[98+coord*2]*256 + res[99+coord*2];
        if (coord>3) {
            mul = 100.0;
        }
        if (val>33000) {
            val -= 65536;
        }
        val = val/mul;
        return val;
    }

    //% blockId=setEndCoords block="[myCobot] Set The End Coordinates: X= $x| , Y= $y| , Z= $z| , RX= $rx| , RY= $ry| , RZ= $rz| , Speed= $speed| \\%"
    //% x.defl=-14
    //% y.defl=-27
    //% z.defl=275
    //% rx.defl=-89.5
    //% ry.defl=0.75
    //% rz.defl=-90.75
    //% speed.min=0 speed.max=100
    //% speed.defl=50
    //% inlineInputMode=inline
    //% weight=85
    //% group="Basic"
    export function setEndCoords(x:number, y:number, z:number, rx:number, ry:number, rz:number, speed:number): void {
        x *= 10;
        y *= 10;
        z *= 10;
        rx *= 100;
        ry *= 100;
        rz *= 100;
        if (x<0) {
            x += 65536;
        }
        if (y<0) {
            y += 65536;
        }
        if (z<0) {
            z += 65536;
        }
        if (rx<0) {
            rx += 65536;
        }
        if (ry<0) {
            ry += 65536;
        }
        if (rz<0) {
            rz += 65536;
        }
        cmd = pins.createBuffer(19);
        cmd[0] = 0xFE;
        cmd[1] = 0xFE;
        cmd[2] = 0x10;
        cmd[3] = 0x25;  // r288
        cmd[4] = (x&0xFF00)>>8;
        cmd[5] = x&0x00FF;
        cmd[6] = (y&0xFF00)>>8;
        cmd[7] = y&0x00FF;
        cmd[8] = (z&0xFF00)>>8;
        cmd[9] = z&0x00FF;
        cmd[10] = (rx&0xFF00)>>8;
        cmd[11] = rx&0x00FF;
        cmd[12] = (ry&0xFF00)>>8;
        cmd[13] = ry&0x00FF;
        cmd[14] = (rz&0xFF00)>>8;
        cmd[15] = rz&0x00FF;
        cmd[16] = speed;
        cmd[17] = 0x01;
        cmd[18] = 0xFA;
        serial.writeBuffer(cmd);
        basic.pause(500);
        serial.readBuffer(0);
    }
    
    //% blockId=setLedColor block="[myCobot] Set The Screen Color: Red= $r| , Green= $g| , Blue= $b|"
    //% r.min=0 r.max=255
    //% r.defl=127
    //% g.min=0 g.max=255
    //% g.defl=127
    //% b.min=0 b.max=255
    //% b.defl=127
    //% weight=75
    //% group="Basic"
    export function setLedColor(r:number, g:number, b:number): void {
        serial.readBuffer(0);
        cmd = pins.createBuffer(8);
        cmd[0] = 0xFE;
        cmd[1] = 0xFE;
        cmd[2] = 0x05;
        cmd[3] = 0x6A;  // r0
        cmd[4] = r;
        cmd[5] = g;
        cmd[6] = b;
        cmd[7] = 0xFA;
        serial.writeBuffer(cmd);
        basic.pause(100);
    }

    //% blockId=setPumpMode block="[myCobot] Set The Pump: Mode= |%mode|"
    //% weight=65
    //% group="Basic"
    export function setPumpMode(mode:ONOFF): void {
        myCobotBasicIo(2, mode);
        myCobotBasicIo(5, mode);
        basic.pause(100);
    }

    //% blockId=setGripperMode block="[myCobot] Set The Gripper: Mode= |%mode| , Speed= $speed| \\%"
    //% speed.min=0 speed.max=100
    //% speed.defl=50
    //% weight=65
    //% group="Basic"
    export function setGripperMode(mode:OPENCLOSE, speed:number): void {
        serial.readBuffer(0);
        cmd = pins.createBuffer(7);
        cmd[0] = 0xFE;
        cmd[1] = 0xFE;
        cmd[2] = 0x04;
        cmd[3] = 0x66;  // r16
        cmd[4] = mode;
        cmd[5] = speed;
        cmd[6] = 0xFA;
        serial.writeBuffer(cmd);
        basic.pause(100);
        serial.readBuffer(0);
    }

    //% blockId=setJogOff block="[myCobot] Set All The Jog Off"
    //% weight=95
    //% group="Advance"
    export function setJogOff(): void {
        serial.readBuffer(0);
        cmd = pins.createBuffer(5);
        cmd[0] = 0xFE;
        cmd[1] = 0xFE;
        cmd[2] = 0x02;
        cmd[3] = 0x34;  // r140
        cmd[4] = 0xFA;
        serial.writeBuffer(cmd);
        basic.pause(100);
        serial.readBuffer(0);
    }

    //% blockId=setJogOn block="[myCobot] Set The Jog Mode: Joint= |%joint| , Direction= |%dir| , Speed= $speed| \\%"
    //% speed.min=0 speed.max=100
    //% speed.defl=50
    //% weight=95
    //% group="Advance"
    export function setJogOn(joint:SERVO, dir:DIR, speed:number): void {
        serial.readBuffer(0);
        cmd = pins.createBuffer(8);
        cmd[0] = 0xFE;
        cmd[1] = 0xFE;
        cmd[2] = 0x05;
        cmd[3] = 0x30;  // r16
        cmd[4] = joint;
        cmd[5] = dir;
        cmd[6] = speed;
        cmd[7] = 0xFA;
        serial.writeBuffer(cmd);
        basic.pause(100);
        serial.readBuffer(0);
    }
    
    //% blockId=getServoAngle block="[myCobot] Angle Of The Servo= |%servo|"
    //% weight=85
    //% group="Advance"
    export function getServoAngle(servo:SERVO): number {
        serial.readBuffer(0);
        cmd = pins.createBuffer(5);
        cmd[0] = 0xFE;
        cmd[1] = 0xFE;
        cmd[2] = 0x02;
        cmd[3] = 0x20;  // r96+17
        cmd[4] = 0xFA;
        serial.writeBuffer(cmd);
        let res = serial.readBuffer(113);        
        let val = res[98+servo*2]*256 + res[99+servo*2];
        if (val>33000) {
            val -= 65536;
        }
        val = val/100.0;
        return val;
    }

    //% blockId=setServoAngle block="[myCobot] Set The Servo |%servo| : Angle= $angle| , Speed= $speed| \\%"
    //% angle.defl=0
    //% speed.min=0 speed.max=100
    //% speed.defl=50
    //% weight=85
    //% group="Advance"
    export function setServoAngle(servo:SERVO, angle:number, speed:number): void {
        serial.readBuffer(0);
        angle *= 100;
        if (angle<0) {
            angle += 65536;
        }
        cmd = pins.createBuffer(9);
        cmd[0] = 0xFE;
        cmd[1] = 0xFE;
        cmd[2] = 0x06;
        cmd[3] = 0x21;  // r208
        cmd[4] = servo-1;
        cmd[5] = (angle&0xFF00)>>8;
        cmd[6] = angle&0x00FF;
        cmd[7] = speed;
        cmd[8] = 0xFA;
        serial.writeBuffer(cmd);
        basic.pause(100);
        serial.readBuffer(0);
    }    
        
    //% blockId=setServoHold block="[myCobot] Set The Servo |%servo| Hold"
    //% weight=75
    //% group="Advance"
    export function setServoHold(servo:SERVO): void {
        cmd = pins.createBuffer(6);
        cmd[0] = 0xFE;
        cmd[1] = 0xFE;
        cmd[2] = 0x03;
        cmd[3] = 0x57;  // r42
        cmd[4] = servo;
        cmd[5] = 0xFA;
        serial.writeBuffer(cmd);
        basic.pause(100);
        serial.readBuffer(0);
    }
    
    //% blockId=setServoFree block="[myCobot] Set The Servo |%servo| Free"
    //% weight=75
    //% group="Advance"
    export function setServoFree(servo:SERVO): void {
        cmd = pins.createBuffer(6);
        cmd[0] = 0xFE;
        cmd[1] = 0xFE;
        cmd[2] = 0x03;
        cmd[3] = 0x56;  // r42
        cmd[4] = servo;
        cmd[5] = 0xFA;
        serial.writeBuffer(cmd);
        basic.pause(100);
        serial.readBuffer(0);
    }
}