# n64sym

[github.com - shygoo/n64sym](https://github.com/shygoo/n64sym)

## n64-sym-builtin.sh

* [swe1r.eu.z64.n64sym.txt](swe1r.eu.z64.n64sym.txt)
* [swe1r.jp.z64.n64sym.txt](swe1r.jp.z64.n64sym.txt)
* [swe1r.us.z64.n64sym.txt](swe1r.us.z64.n64sym.txt)

## n64-sym.sh

```console
$ ./n64-sym.sh
== swe1r.eu.z64 ==
-- 2.0I --
7FFFF400 osViModeTable
7FFFF408 __osThreadSave
80005B70 osAckRamromRead
8008D930 __osGetActiveQueue
80092960 alSynDelete
80099700 osGetThreadPri
8009AFF0 alFilterNew
8009D540 rspbootTextStart
8009E9A0 aspMainDataStart
-- 2.0J --
7FFFF400 osViModeTable
7FFFF408 __osThreadSave
80005B70 n_alSynFreeFX
80011DB8 osViExtendVStart
8008D930 __osGetCurrFaultedThread
80092960 alSynDelete
80099700 osGetThreadPri
8009A7F0 __osLeoInterrupt
8009AFF0 alFilterNew
8009D310 osLeoDiskInit
8009D384 __osDiskHandle
8009D540 rspbootTextStart
8009D610 gspF3DEX2_NoN_fifoDataStart
8009E9A0 aspMainDataStart

== swe1r.jp.z64 ==
-- 2.0I --
7FFFF400 osViModeTable
7FFFF408 __osThreadSave
80005B70 osAckRamromRead
800890D0 __osGetActiveQueue
8008E100 alSynDelete
80094EA0 osGetThreadPri
80096790 alFilterNew
80098CE0 rspbootTextStart
8009A140 aspMainDataStart
-- 2.0J --
7FFFF400 osViModeTable
7FFFF408 __osThreadSave
80005B70 n_alSynFreeFX
80011928 osViExtendVStart
800890D0 __osGetCurrFaultedThread
8008E100 alSynDelete
80094EA0 osGetThreadPri
80095F90 __osLeoInterrupt
80096790 alFilterNew
80098AB0 osLeoDiskInit
80098B24 __osDiskHandle
80098CE0 rspbootTextStart
80098DB0 gspF3DEX2_NoN_fifoDataStart
8009A140 aspMainDataStart

== swe1r.us.z64 ==
-- 2.0I --
7FFFF400 osViModeTable
7FFFF408 __osThreadSave
80005B70 osAckRamromRead
800883E0 __osGetActiveQueue
8008D410 alSynDelete
800941B0 osGetThreadPri
80095AA0 alFilterNew
80097FF0 rspbootTextStart
80099450 aspMainDataStart
-- 2.0J --
7FFFF400 osViModeTable
7FFFF408 __osThreadSave
80005B70 n_alSynFreeFX
80011928 osViExtendVStart
800883E0 __osGetCurrFaultedThread
8008D410 alSynDelete
800941B0 osGetThreadPri
800952A0 __osLeoInterrupt
80095AA0 alFilterNew
80097DC0 osLeoDiskInit
80097E34 __osDiskHandle
80097FF0 rspbootTextStart
800980C0 gspF3DEX2_NoN_fifoDataStart
80099450 aspMainDataStart

```
