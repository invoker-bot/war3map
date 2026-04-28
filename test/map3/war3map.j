globals
//globals from Ascii:
constant boolean LIBRARY_Ascii=true
integer array Ascii__i
integer array Ascii__h
integer array Ascii__y
string array Ascii__c
//endglobals from Ascii
//globals from TasSpellView:
constant boolean LIBRARY_TasSpellView=true
constant boolean REFORGED= false
boolean TasSpellView_AutoRun= true
string TasSpellView_TocPath= "war3mapImported\\TasSpellView.toc"

string TasSpellView_TextDisallowed= "X"

real TasSpellView_UpdateTime= 0.1
boolean TasSpellView_ShowCooldown= true
boolean TasSpellView_ShowCooldownText= true
boolean TasSpellView_ShowAlly= true
boolean TasSpellView_ShowEnemy= true
boolean TasSpellView_ShowNeutral= true
boolean TasSpellView_ShowHero= true
boolean TasSpellView_UseCommandCardPos= true
boolean TasSpellView_UseCommandCardPosHero= true
boolean TasSpellView_ShortBigNumber= true

        //ToolTip
real TasSpellView_ToolTipSizeX= 0.26
real TasSpellView_ToolTipPosX= 0.79
real TasSpellView_ToolTipPosY= 0.165
framepointtype TasSpellView_ToolTipPos= FRAMEPOINT_BOTTOMRIGHT

// currentSelected
integer array TasSpellView_DataFourCC
string array TasSpellView_DataMana
string array TasSpellView_DataRange
string array TasSpellView_DataAoe
string array TasSpellView_DataCool
string array TasSpellView_DataName
string array TasSpellView_DataText
string array TasSpellView_DataIcon
boolean array TasSpellView_DataUsed

framehandle TasSpellView_ParentSimple
framehandle TasSpellView_Parent

framehandle TasSpellView_Tooltip
framehandle TasSpellView_TooltipBox
framehandle TasSpellView_TooltipIcon
framehandle TasSpellView_TooltipName
framehandle TasSpellView_TooltipSep
framehandle TasSpellView_TooltipText
framehandle TasSpellView_TooltipTextMana
framehandle TasSpellView_TooltipTextRange
framehandle TasSpellView_TooltipTextArea
framehandle TasSpellView_TooltipTextCool

group TasSpellView_Group
timer TasSpellView_Timer

framehandle array TasSpellView_Button
framehandle array TasSpellView_Icon
framehandle array TasSpellView_OverLayFrame
framehandle array TasSpellView_OverLayText
framehandle array TasSpellView_ChargeBox
framehandle array TasSpellView_ChargeBoxText
framehandle array TasSpellView_Cooldown
framehandle array TasSpellView_TextCool
framehandle array TasSpellView_SimpleButton
framehandle array TasSpellView_SimpleTooltip


unit TasSpellView_LastUnit= null
integer TasSpellView_LastUnitCode= 0
integer TasSpellView_LastHoveredIndex= - 1
        


string array TasSpellView_UnitCodeText
integer array TasSpellView_UnitCodeType
integer TasSpellView_UnitCodeCount= 0

integer TasSpellView_TechCodeCount= 0
integer array TasSpellView_TechCodeSkill
integer array TasSpellView_TechCodeTech
integer array TasSpellView_TechCodeTechLevel
//endglobals from TasSpellView
//globals from TasSpellViewDemo:
constant boolean LIBRARY_TasSpellViewDemo=true
//endglobals from TasSpellViewDemo
    // Generated
trigger gg_trg_At_0s= null
trigger gg_trg_At_0s_Kopieren= null

trigger l__library_init

//JASSHelper struct globals:
constant integer si__Ascii__Inits=1

endglobals


//library Ascii:
    function Char2Ascii takes string p returns integer
        local integer z= Ascii__i[StringHash(p) / 0x1F0748 + 0x40D]
        if ( Ascii__c[z] != p ) then
            if ( Ascii__c[z - 32] != p ) then
                if ( Ascii__c[Ascii__h[z]] != p ) then
                    if ( Ascii__c[Ascii__y[z]] != p ) then
                        if ( Ascii__c[83] != p ) then
                            return 0
                        endif
                        return 83
                    endif
                    return Ascii__y[z]
                endif
                return Ascii__h[z]
            endif
            return z - 32
        endif
        return z
    endfunction
    function Ascii2Char takes integer a returns string
        return Ascii__c[a]
    endfunction
    function A2S takes integer a returns string
        local string s=""
        loop
            set s=Ascii__c[a - a / 256 * 256] + s
            set a=a / 256
            exitwhen 0 == a
        endloop
        return s
    endfunction
    function S2A takes string s returns integer
        local integer a=0
        local integer l=StringLength(s)
        local integer j=0
        local string m
        local integer l__Ascii__h
        loop
            exitwhen j == l
            set a=a * 256 + Char2Ascii(SubString(s, j, j + 1))
            set j=j + 1
        endloop
        return a
    endfunction
//Implemented from module Ascii__Init:
        function s__Ascii__Inits_Ascii__Init___onInit takes nothing returns nothing
            set Ascii__i[966]=8
            set Ascii__i[1110]=9
            set Ascii__i[1621]=10
            set Ascii__i[1375]=12
            set Ascii__i[447]=13
            set Ascii__i[233]=32
            set Ascii__i[2014]=33
            set Ascii__i[1348]=34
            set Ascii__i[1038]=35
            set Ascii__i[1299]=36
            set Ascii__i[1018]=37
            set Ascii__i[1312]=38
            set Ascii__i[341]=39
            set Ascii__i[939]=40
            set Ascii__i[969]=41
            set Ascii__i[952]=42
            set Ascii__i[2007]=43
            set Ascii__i[1415]=44
            set Ascii__i[2020]=45
            set Ascii__i[904]=46
            set Ascii__i[1941]=47
            set Ascii__i[918]=48
            set Ascii__i[1593]=49
            set Ascii__i[719]=50
            set Ascii__i[617]=51
            set Ascii__i[703]=52
            set Ascii__i[573]=53
            set Ascii__i[707]=54
            set Ascii__i[1208]=55
            set Ascii__i[106]=56
            set Ascii__i[312]=57
            set Ascii__i[124]=58
            set Ascii__i[1176]=59
            set Ascii__i[74]=60
            set Ascii__i[1206]=61
            set Ascii__i[86]=62
            set Ascii__i[340]=63
            set Ascii__i[35]=64
            set Ascii__i[257]=65
            set Ascii__i[213]=66
            set Ascii__i[271]=67
            set Ascii__i[219]=68
            set Ascii__i[1330]=69
            set Ascii__i[1425]=70
            set Ascii__i[1311]=71
            set Ascii__i[238]=72
            set Ascii__i[1349]=73
            set Ascii__i[244]=74
            set Ascii__i[1350]=75
            set Ascii__i[205]=76
            set Ascii__i[1392]=77
            set Ascii__i[1378]=78
            set Ascii__i[1432]=79
            set Ascii__i[1455]=80
            set Ascii__i[1454]=81
            set Ascii__i[1431]=82
            set Ascii__i[1409]=83
            set Ascii__i[1442]=84
            set Ascii__i[534]=85
            set Ascii__i[1500]=86
            set Ascii__i[771]=87
            set Ascii__i[324]=88
            set Ascii__i[1021]=89
            set Ascii__i[73]=90
            set Ascii__i[1265]=91
            set Ascii__i[1941]=92
            set Ascii__i[1671]=93
            set Ascii__i[1451]=94
            set Ascii__i[1952]=95
            set Ascii__i[252]=96
            set Ascii__i[257]=97
            set Ascii__i[213]=98
            set Ascii__i[271]=99
            set Ascii__i[219]=100
            set Ascii__i[1330]=101
            set Ascii__i[1425]=102
            set Ascii__i[1311]=103
            set Ascii__i[238]=104
            set Ascii__i[1349]=105
            set Ascii__i[244]=106
            set Ascii__i[1350]=107
            set Ascii__i[205]=108
            set Ascii__i[1392]=109
            set Ascii__i[1378]=110
            set Ascii__i[1432]=111
            set Ascii__i[1455]=112
            set Ascii__i[1454]=113
            set Ascii__i[1431]=114
            set Ascii__i[1409]=115
            set Ascii__i[1442]=116
            set Ascii__i[534]=117
            set Ascii__i[1500]=118
            set Ascii__i[771]=119
            set Ascii__i[324]=120
            set Ascii__i[1021]=121
            set Ascii__i[73]=122
            set Ascii__i[868]=123
            set Ascii__i[1254]=124
            set Ascii__i[588]=125
            set Ascii__i[93]=126
            set Ascii__i[316]=161
            set Ascii__i[779]=162
            set Ascii__i[725]=163
            set Ascii__i[287]=164
            set Ascii__i[212]=165
            set Ascii__i[7]=166
            set Ascii__i[29]=167
            set Ascii__i[1958]=168
            set Ascii__i[1009]=169
            set Ascii__i[1580]=170
            set Ascii__i[1778]=171
            set Ascii__i[103]=172
            set Ascii__i[400]=174
            set Ascii__i[1904]=175
            set Ascii__i[135]=176
            set Ascii__i[1283]=177
            set Ascii__i[469]=178
            set Ascii__i[363]=179
            set Ascii__i[550]=180
            set Ascii__i[1831]=181
            set Ascii__i[1308]=182
            set Ascii__i[1234]=183
            set Ascii__i[1017]=184
            set Ascii__i[1093]=185
            set Ascii__i[1577]=186
            set Ascii__i[606]=187
            set Ascii__i[1585]=188
            set Ascii__i[1318]=189
            set Ascii__i[980]=190
            set Ascii__i[1699]=191
            set Ascii__i[1292]=192
            set Ascii__i[477]=193
            set Ascii__i[709]=194
            set Ascii__i[1600]=195
            set Ascii__i[2092]=196
            set Ascii__i[50]=197
            set Ascii__i[546]=198
            set Ascii__i[408]=199
            set Ascii__i[853]=200
            set Ascii__i[205]=201
            set Ascii__i[411]=202
            set Ascii__i[1311]=203
            set Ascii__i[1422]=204
            set Ascii__i[1808]=205
            set Ascii__i[457]=206
            set Ascii__i[1280]=207
            set Ascii__i[614]=208
            set Ascii__i[1037]=209
            set Ascii__i[237]=210
            set Ascii__i[1409]=211
            set Ascii__i[1023]=212
            set Ascii__i[1361]=213
            set Ascii__i[695]=214
            set Ascii__i[161]=215
            set Ascii__i[1645]=216
            set Ascii__i[1822]=217
            set Ascii__i[644]=218
            set Ascii__i[1395]=219
            set Ascii__i[677]=220
            set Ascii__i[1677]=221
            set Ascii__i[881]=222
            set Ascii__i[861]=223
            set Ascii__i[1408]=224
            set Ascii__i[1864]=225
            set Ascii__i[1467]=226
            set Ascii__i[1819]=227
            set Ascii__i[1971]=228
            set Ascii__i[949]=229
            set Ascii__i[774]=230
            set Ascii__i[1828]=231
            set Ascii__i[865]=232
            set Ascii__i[699]=233
            set Ascii__i[786]=234
            set Ascii__i[1806]=235
            set Ascii__i[1286]=236
            set Ascii__i[1128]=237
            set Ascii__i[1490]=238
            set Ascii__i[1720]=239
            set Ascii__i[1817]=240
            set Ascii__i[729]=241
            set Ascii__i[1191]=242
            set Ascii__i[1164]=243
            set Ascii__i[413]=244
            set Ascii__i[349]=245
            set Ascii__i[1409]=246
            set Ascii__i[660]=247
            set Ascii__i[2016]=248
            set Ascii__i[1087]=249
            set Ascii__i[1497]=250
            set Ascii__i[753]=251
            set Ascii__i[1579]=252
            set Ascii__i[1456]=253
            set Ascii__i[606]=254
            set Ascii__i[1625]=255
            set Ascii__h[92]=47
            set Ascii__h[201]=108
            set Ascii__h[201]=76
            set Ascii__h[203]=103
            set Ascii__h[203]=71
            set Ascii__h[246]=115
            set Ascii__h[246]=83
            set Ascii__h[246]=211
            set Ascii__h[254]=187
            set Ascii__y[201]=108
            set Ascii__y[203]=103
            set Ascii__y[246]=115

            set Ascii__c[8]="\b"
            set Ascii__c[9]="\t"
            set Ascii__c[10]="\n"
            set Ascii__c[12]="\f"
            set Ascii__c[13]="\r"
            set Ascii__c[32]=" "
            set Ascii__c[33]="!"
            set Ascii__c[34]="\""
            set Ascii__c[35]="#"
            set Ascii__c[36]="$"
            set Ascii__c[37]=""
            set Ascii__c[38]="&"
            set Ascii__c[39]="'"
            set Ascii__c[40]="("
            set Ascii__c[41]=")"
            set Ascii__c[42]="*"
            set Ascii__c[43]="+"
            set Ascii__c[44]=","
            set Ascii__c[45]="-"
            set Ascii__c[46]="."
            set Ascii__c[47]="/"
            set Ascii__c[48]="0"
            set Ascii__c[49]="1"
            set Ascii__c[50]="2"
            set Ascii__c[51]="3"
            set Ascii__c[52]="4"
            set Ascii__c[53]="5"
            set Ascii__c[54]="6"
            set Ascii__c[55]="7"
            set Ascii__c[56]="8"
            set Ascii__c[57]="9"
            set Ascii__c[58]=":"
            set Ascii__c[59]=";"
            set Ascii__c[60]="<"
            set Ascii__c[61]="="
            set Ascii__c[62]=">"
            set Ascii__c[63]="?"
            set Ascii__c[64]="@"
            set Ascii__c[65]="A"
            set Ascii__c[66]="B"
            set Ascii__c[67]="C"
            set Ascii__c[68]="D"
            set Ascii__c[69]="E"
            set Ascii__c[70]="F"
            set Ascii__c[71]="G"
            set Ascii__c[72]="H"
            set Ascii__c[73]="I"
            set Ascii__c[74]="J"
            set Ascii__c[75]="K"
            set Ascii__c[76]="L"
            set Ascii__c[77]="M"
            set Ascii__c[78]="N"
            set Ascii__c[79]="O"
            set Ascii__c[80]="P"
            set Ascii__c[81]="Q"
            set Ascii__c[82]="R"
            set Ascii__c[83]="S"
            set Ascii__c[84]="T"
            set Ascii__c[85]="U"
            set Ascii__c[86]="V"
            set Ascii__c[87]="W"
            set Ascii__c[88]="X"
            set Ascii__c[89]="Y"
            set Ascii__c[90]="Z"
            set Ascii__c[91]="["
            set Ascii__c[92]="\\"
            set Ascii__c[93]="]"
            set Ascii__c[94]="^"
            set Ascii__c[95]="_"
            set Ascii__c[96]="`"
            set Ascii__c[97]="a"
            set Ascii__c[98]="b"
            set Ascii__c[99]="c"
            set Ascii__c[100]="d"
            set Ascii__c[101]="e"
            set Ascii__c[102]="f"
            set Ascii__c[103]="g"
            set Ascii__c[104]="h"
            set Ascii__c[105]="i"
            set Ascii__c[106]="j"
            set Ascii__c[107]="k"
            set Ascii__c[108]="l"
            set Ascii__c[109]="m"
            set Ascii__c[110]="n"
            set Ascii__c[111]="o"
            set Ascii__c[112]="p"
            set Ascii__c[113]="q"
            set Ascii__c[114]="r"
            set Ascii__c[115]="s"
            set Ascii__c[116]="t"
            set Ascii__c[117]="u"
            set Ascii__c[118]="v"
            set Ascii__c[119]="w"
            set Ascii__c[120]="x"
            set Ascii__c[121]="y"
            set Ascii__c[122]="z"
            set Ascii__c[123]="{"
            set Ascii__c[124]="|"
            set Ascii__c[125]="}"
            set Ascii__c[126]="~"
            set Ascii__c[128]="€"
            set Ascii__c[130]="‚"
            set Ascii__c[131]="ƒ"
            set Ascii__c[132]="„"
            set Ascii__c[133]="…"
            set Ascii__c[134]="†"
            set Ascii__c[135]="‡"
            set Ascii__c[136]="ˆ"
            set Ascii__c[137]="‰"
            set Ascii__c[138]="Š"
            set Ascii__c[139]="‹"
            set Ascii__c[140]="Œ"
            set Ascii__c[142]="Ž"
            set Ascii__c[145]="‘"
            set Ascii__c[146]="’"
            set Ascii__c[147]="“"
            set Ascii__c[148]="”"
            set Ascii__c[149]="•"
            set Ascii__c[150]="–"
            set Ascii__c[151]="—"
            set Ascii__c[152]="˜"
            set Ascii__c[153]="™"
            set Ascii__c[154]="š"
            set Ascii__c[155]="›"
            set Ascii__c[156]="œ"
            set Ascii__c[158]="ž"
            set Ascii__c[159]="Ÿ"
            set Ascii__c[160]=" "
            set Ascii__c[161]="¡"
            set Ascii__c[162]="¢"
            set Ascii__c[163]="£"
            set Ascii__c[164]="¤"
            set Ascii__c[165]="¥"
            set Ascii__c[166]="¦"
            set Ascii__c[167]="§"
            set Ascii__c[168]="¨"
            set Ascii__c[169]="©"
            set Ascii__c[170]="ª"
            set Ascii__c[171]="«"
            set Ascii__c[172]="¬"
            set Ascii__c[174]="®"
            set Ascii__c[175]="¯"
            set Ascii__c[176]="°"
            set Ascii__c[177]="±"
            set Ascii__c[178]="²"
            set Ascii__c[179]="³"
            set Ascii__c[180]="´"
            set Ascii__c[181]="µ"
            set Ascii__c[182]="¶"
            set Ascii__c[183]="·"
            set Ascii__c[184]="¸"
            set Ascii__c[185]="¹"
            set Ascii__c[186]="º"
            set Ascii__c[187]="»"
            set Ascii__c[188]="¼"
            set Ascii__c[189]="½"
            set Ascii__c[190]="¾"
            set Ascii__c[191]="¿"
            set Ascii__c[192]="À"
            set Ascii__c[193]="Á"
            set Ascii__c[194]="Â"
            set Ascii__c[195]="Ã"
            set Ascii__c[196]="Ä"
            set Ascii__c[197]="Å"
            set Ascii__c[198]="Æ"
            set Ascii__c[199]="Ç"
            set Ascii__c[200]="È"
            set Ascii__c[201]="É"
            set Ascii__c[202]="Ê"
            set Ascii__c[203]="Ë"
            set Ascii__c[204]="Ì"
            set Ascii__c[205]="Í"
            set Ascii__c[206]="Î"
            set Ascii__c[207]="Ï"
            set Ascii__c[208]="Ð"
            set Ascii__c[209]="Ñ"
            set Ascii__c[210]="Ò"
            set Ascii__c[211]="Ó"
            set Ascii__c[212]="Ô"
            set Ascii__c[213]="Õ"
            set Ascii__c[214]="Ö"
            set Ascii__c[215]="×"
            set Ascii__c[216]="Ø"
            set Ascii__c[217]="Ù"
            set Ascii__c[218]="Ú"
            set Ascii__c[219]="Û"
            set Ascii__c[220]="Ü"
            set Ascii__c[221]="Ý"
            set Ascii__c[222]="Þ"
            set Ascii__c[223]="ß"
            set Ascii__c[224]="à"
            set Ascii__c[225]="á"
            set Ascii__c[226]="â"
            set Ascii__c[227]="ã"
            set Ascii__c[228]="ä"
            set Ascii__c[229]="å"
            set Ascii__c[230]="æ"
            set Ascii__c[231]="ç"
            set Ascii__c[232]="è"
            set Ascii__c[233]="é"
            set Ascii__c[234]="ê"
            set Ascii__c[235]="ë"
            set Ascii__c[236]="ì"
            set Ascii__c[237]="í"
            set Ascii__c[238]="î"
            set Ascii__c[239]="ï"
            set Ascii__c[240]="ð"
            set Ascii__c[241]="ñ"
            set Ascii__c[242]="ò"
            set Ascii__c[243]="ó"
            set Ascii__c[244]="ô"
            set Ascii__c[245]="õ"
            set Ascii__c[246]="ö"
            set Ascii__c[247]="÷"
            set Ascii__c[248]="ø"
            set Ascii__c[249]="ù"
            set Ascii__c[250]="ú"
            set Ascii__c[251]="û"
            set Ascii__c[252]="ü"
            set Ascii__c[253]="ý"
            set Ascii__c[254]="þ"
            set Ascii__c[255]="ÿ"
        endfunction

//library Ascii ends
//library TasSpellView:



    function TasSpellView_ParentFuncSimple takes nothing returns framehandle
        if GetHandleId(BlzGetFrameByName("CommandBarFrame", 0)) > 0 then
            return BlzGetFrameByName("CommandBarFrame", 0)
        endif
        return BlzGetFrameByName("ConsoleUI", 0)
    endfunction
    function TasSpellView_ParentFunc takes nothing returns framehandle
       // if GetHandleId(BlzGetFrameByName("ConsoleUIBackdrop", 0)) > 0 then
       //     return BlzGetFrameByName("ConsoleUIBackdrop",  0)
       // endif
        return BlzGetOriginFrame(ORIGIN_FRAME_GAME_UI, 0)
    endfunction

    function TasSpellView_AbiFilter takes ability abi,string text returns boolean
        local integer pos
        local integer posY
        if BlzGetAbilityBooleanField(abi, ABILITY_BF_ITEM_ABILITY) then
            return false
        endif
        set posY=BlzGetAbilityIntegerField(abi, ABILITY_IF_BUTTON_POSITION_NORMAL_Y)
        if posY == - 11 then
             return false
        endif
        set pos=BlzGetAbilityIntegerField(abi, ABILITY_IF_BUTTON_POSITION_NORMAL_X) + posY * 4
        if pos < 0 or pos > 11 then
            return false
        endif
        if text == "Tool tip missing!" or text == "" or text == " " then
            return false
        endif
        return true
    endfunction

    function TasSpellView_GetTechReq takes integer skill returns integer
        local integer i= TasSpellView_TechCodeCount
        loop
            exitwhen i <= 0
            if skill == TasSpellView_TechCodeSkill[i] then
                return i
            endif
            set i=i - 1
        endloop
        return - 1
    endfunction

    function TasSpellView_AddTechReq takes integer skill,integer tech,integer techLevel returns nothing
        set TasSpellView_TechCodeCount=TasSpellView_TechCodeCount + 1
        set TasSpellView_TechCodeSkill[TasSpellView_TechCodeCount]=skill
        set TasSpellView_TechCodeTech[TasSpellView_TechCodeCount]=tech
        set TasSpellView_TechCodeTechLevel[TasSpellView_TechCodeCount]=techLevel
    endfunction

    function TasSpellView_TechFullFilled takes player p,integer skill returns boolean
        local integer data= TasSpellView_GetTechReq(skill)
        if data <= 0 then
            return true
        else
            return GetPlayerTechCount(p, TasSpellView_TechCodeTech[data], true) >= TasSpellView_TechCodeTechLevel[data]
        endif
    endfunction
    
    function TasSpellView_AddUnitCodeData takes integer unitCode,string abiCodeString returns nothing
        set TasSpellView_UnitCodeCount=TasSpellView_UnitCodeCount + 1
        set TasSpellView_UnitCodeType[TasSpellView_UnitCodeCount]=unitCode
        set TasSpellView_UnitCodeText[TasSpellView_UnitCodeCount]=abiCodeString
    endfunction

    
    function TasSpellView_GetUnitCodeData takes integer unitCode returns string
        local integer i= TasSpellView_UnitCodeCount
        loop
            exitwhen i <= 0
            if unitCode == TasSpellView_UnitCodeType[i] then
                return TasSpellView_UnitCodeText[i]
            endif
            set i=i - 1
        endloop
        return ""
    endfunction
    function TasSpellView_ShowAllowed takes unit u,player localPlayer returns boolean
        local integer controlType= GetHandleId(GetPlayerController(GetOwningPlayer(u)))
        if TasSpellView_ShowNeutral and controlType >= 2 then
            return true
        endif

        if not TasSpellView_ShowAlly and IsUnitAlly(u, localPlayer) then
             return false
        endif
        if not TasSpellView_ShowEnemy and IsUnitEnemy(u, localPlayer) then
             return false
        endif
        if not TasSpellView_ShowHero and IsHeroUnitId(GetUnitTypeId(u)) then
            return false
        endif

        return true
    endfunction
function TasSpellView_GetUnitDataAddSkill takes unit u,integer index,integer skill returns nothing
        local integer i= index
        local ability abi= BlzGetUnitAbility(u, skill)
        local integer level= GetUnitAbilityLevel(u, skill)
        local integer mana
        local integer range
        local integer aoe

        set TasSpellView_DataFourCC[i]=skill
        set TasSpellView_DataUsed[i]=true
        set TasSpellView_DataIcon[i]=BlzGetAbilityIcon(skill)
        call BlzFrameSetTexture(TasSpellView_Icon[i], TasSpellView_DataIcon[i], 0, false)

        if level > 0 then
            set mana=BlzGetUnitAbilityManaCost(u, skill, level - 1)
            set TasSpellView_DataCool[i]=I2S(R2I(BlzGetUnitAbilityCooldown(u, skill, level - 1)))
            set range=R2I(BlzGetAbilityRealLevelField(abi, ABILITY_RLF_CAST_RANGE, level - 1))
            set aoe=R2I(BlzGetAbilityRealLevelField(abi, ABILITY_RLF_AREA_OF_EFFECT, level - 1))
            set TasSpellView_DataName[i]=BlzGetAbilityTooltip(skill, level - 1)
            set TasSpellView_DataText[i]=BlzGetAbilityExtendedTooltip(skill, level - 1)
        else
            set TasSpellView_DataName[i]=BlzGetAbilityResearchTooltip(skill, 0)
            set TasSpellView_DataText[i]=BlzGetAbilityResearchExtendedTooltip(skill, 0)
            set mana=BlzGetAbilityManaCost(skill, 0)
            set TasSpellView_DataCool[i]=I2S(R2I(BlzGetAbilityCooldown(skill, 0)))
            set range=0
            set aoe=0
        endif
        set TasSpellView_DataMana[i]=I2S(mana)
        set TasSpellView_DataRange[i]=I2S(range)
        set TasSpellView_DataAoe[i]=I2S(aoe)
        if TasSpellView_ShortBigNumber then
            if mana > 9999 then
                set TasSpellView_DataMana[i]=I2S(mana / 1000) + "k"
            endif
            if range > 9999 then
                set TasSpellView_DataRange[i]=I2S(range / 1000) + "k"
            endif
            if aoe > 9999 then
                set TasSpellView_DataAoe[i]=I2S(aoe / 1000) + "k"
            endif
        endif
        set abi=null
    endfunction

    function TasSpellView_AddSpellString takes string abiString,boolean commandCardPos returns nothing
        local integer startIndex= 0
        local integer skillCode
        local integer addCount= 0
        local integer pos= 0
        loop
        exitwhen startIndex + 3 >= StringLength(abiString)
            set skillCode=S2A(SubString(abiString, startIndex, startIndex + 4))
            set startIndex=startIndex + 5
            if commandCardPos then
                set pos=BlzGetAbilityPosX(skillCode) + BlzGetAbilityPosY(skillCode) * 4
                if pos >= 0 and pos <= 11 then
                    set TasSpellView_DataFourCC[pos]=skillCode
                endif
            else
                set TasSpellView_DataFourCC[addCount]=skillCode
                set addCount=addCount + 1
            endif
        endloop
    endfunction


    function TasSpellView_GetUnitData takes unit u returns nothing
        local integer i= 0
        local integer addCount= 0
        local integer insertPos
        local integer pos
        local ability abi
        local string abiString
        local integer unitCode= GetUnitTypeId(u)
        local boolean isHero= IsHeroUnitId(unitCode)
        local boolean commandCardPos= ( not isHero and TasSpellView_UseCommandCardPos ) or ( isHero and TasSpellView_UseCommandCardPosHero )
        local integer mana
        local integer range
        local integer aoe
        loop
            exitwhen i > 11
            set TasSpellView_DataFourCC[i]=0
            set TasSpellView_DataUsed[i]=false
            set i=i + 1
        endloop
        if unitCode <= 0 then
            return
        endif

        // have presaved Data
        set abiString=TasSpellView_GetUnitCodeData(GetUnitTypeId(u))
        if abiString != "" then

                call TasSpellView_AddSpellString(abiString , commandCardPos)

            set i=0
            loop
                exitwhen i > 11
                if TasSpellView_DataFourCC[i] > 0 then
                    call TasSpellView_GetUnitDataAddSkill(u , i , TasSpellView_DataFourCC[i])
                endif
                set i=i + 1
            endloop
        else
            set i=0
            set addCount=0
            loop
                set abi=BlzGetUnitAbilityByIndex(u, i)
                exitwhen abi == null
                exitwhen i > 9999
                exitwhen addCount > 11
                if TasSpellView_AbiFilter(abi , BlzGetAbilityStringLevelField(abi, ABILITY_SLF_TOOLTIP_NORMAL, 0)) then



















                        set insertPos=addCount
                        if commandCardPos then
                            set pos=BlzGetAbilityIntegerField(abi, ABILITY_IF_BUTTON_POSITION_NORMAL_X) + BlzGetAbilityIntegerField(abi, ABILITY_IF_BUTTON_POSITION_NORMAL_Y) * 4
                            if pos >= 0 and pos <= 11 then
                             set insertPos=pos
                            endif
                        endif
                        // store the data
                        set TasSpellView_DataUsed[insertPos]=true
                        set TasSpellView_DataIcon[insertPos]=BlzGetAbilityStringLevelField(abi, ABILITY_SLF_ICON_NORMAL, 0)
                        call BlzFrameSetTexture(TasSpellView_Icon[insertPos], TasSpellView_DataIcon[insertPos], 0, false)
                        set TasSpellView_DataName[insertPos]=BlzGetAbilityStringLevelField(abi, ABILITY_SLF_TOOLTIP_NORMAL, 0)
                        set TasSpellView_DataText[insertPos]=BlzGetAbilityStringLevelField(abi, ABILITY_SLF_TOOLTIP_NORMAL_EXTENDED, 0)
                        set mana=BlzGetAbilityIntegerLevelField(abi, ABILITY_ILF_MANA_COST, 0)
                        set TasSpellView_DataCool[insertPos]=R2SW(BlzGetAbilityRealLevelField(abi, ABILITY_RLF_COOLDOWN, 0), 1, 1)
                        set range=R2I(BlzGetAbilityRealLevelField(abi, ABILITY_RLF_CAST_RANGE, 0))
                        set aoe=R2I(BlzGetAbilityRealLevelField(abi, ABILITY_RLF_AREA_OF_EFFECT, 0))

                        set TasSpellView_DataMana[insertPos]=I2S(mana)
                        set TasSpellView_DataRange[insertPos]=I2S(range)
                        set TasSpellView_DataAoe[insertPos]=I2S(aoe)
                        if TasSpellView_ShortBigNumber then
                            if mana > 9999 then
                                set TasSpellView_DataMana[insertPos]=I2S(mana / 1000) + "k"
                            endif
                            if range > 9999 then
                                set TasSpellView_DataRange[insertPos]=I2S(range / 1000) + "k"
                            endif
                            if aoe > 9999 then
                                set TasSpellView_DataAoe[insertPos]=I2S(aoe / 1000) + "k"
                            endif
                        endif

                    
                    set addCount=addCount + 1
                endif
                set i=i + 1
            endloop
            set abi=null
        endif
    endfunction

    function TasSpellView_Update takes nothing returns nothing
        local boolean foundTooltip= false
        local unit u
        local boolean hasControl
        local boolean showSpellView
        local boolean stillShowLastTooltip
        local integer i
        local integer level
        local real cdRemain
        local real cdTotal
        local integer abiCode
        local ability abi
        local integer uCode
        // check for visible buttons, if any is visible then do not show TasSpellView
        set i=0
        loop
            if BlzFrameIsVisible(BlzGetOriginFrame(ORIGIN_FRAME_COMMAND_BUTTON, i)) then
                call BlzFrameSetVisible(TasSpellView_ParentSimple, false)
                call BlzFrameSetVisible(TasSpellView_Parent, false)
                return
            endif
            exitwhen i == 11
            set i=i + 1
        endloop
        
        call GroupEnumUnitsSelected(TasSpellView_Group, GetLocalPlayer(), null)
        set u=FirstOfGroup(TasSpellView_Group)
        call GroupClear(TasSpellView_Group)
        set uCode=GetUnitTypeId(u)
        if u != TasSpellView_LastUnit or TasSpellView_LastUnitCode != uCode then
            set TasSpellView_LastUnit=u
            set TasSpellView_LastUnitCode=uCode
            call TasSpellView_GetUnitData(u)
            set i=0
            set TasSpellView_LastHoveredIndex=- 1
            loop
                call BlzFrameSetVisible(TasSpellView_Button[i], TasSpellView_DataUsed[i])
                if TasSpellView_DataFourCC[i] > 0 then
                    call BlzFrameSetVisible(TasSpellView_Cooldown[i], true)
                    call BlzFrameSetVisible(TasSpellView_OverLayFrame[i], true)
                else
                    call BlzFrameSetVisible(TasSpellView_Cooldown[i], false)
                    call BlzFrameSetVisible(TasSpellView_OverLayFrame[i], false)
                endif
                exitwhen i == 11
                set i=i + 1
            endloop
        endif

        if uCode > 0 then
            set hasControl=IsUnitOwnedByPlayer(u, GetLocalPlayer()) or GetPlayerAlliance(GetOwningPlayer(u), GetLocalPlayer(), ALLIANCE_SHARED_CONTROL)
            // user = 0 computer = 1, treat all above as Neutral
            set showSpellView=not hasControl
            if showSpellView then
                set showSpellView=TasSpellView_ShowAllowed(u , GetLocalPlayer())
            endif
        else
            set showSpellView=false
        endif
        call BlzFrameSetVisible(TasSpellView_ParentSimple, showSpellView)
        call BlzFrameSetVisible(TasSpellView_Parent, showSpellView)
        if showSpellView then
            set stillShowLastTooltip=TasSpellView_LastHoveredIndex >= 0 and BlzFrameIsVisible(TasSpellView_SimpleTooltip[TasSpellView_LastHoveredIndex])
            set i=0
            loop
                if TasSpellView_DataUsed[i] then
                    if TasSpellView_DataFourCC[i] > 0 then
                        set abiCode=TasSpellView_DataFourCC[i]
                        set level=GetUnitAbilityLevel(u, abiCode)

                        if TasSpellView_ShowCooldown then
                            set cdRemain=BlzGetUnitAbilityCooldownRemaining(u, abiCode)
                            if cdRemain > 0 then
                                if TasSpellView_ShowCooldownText then
                                    call BlzFrameSetVisible(TasSpellView_TextCool[i], true)
                                    if cdRemain > 5 then
                                        call BlzFrameSetText(TasSpellView_TextCool[i], I2S(R2I(cdRemain)))
                                    else
                                        call BlzFrameSetText(TasSpellView_TextCool[i], R2SW(cdRemain, 1, 1))
                                    endif
                                else
                                    call BlzFrameSetVisible(TasSpellView_TextCool[i], false)
                                endif
                                // this be inaccurate when the map has systems to change cooldowns only during the casting.
                                set cdTotal=BlzGetUnitAbilityCooldown(u, abiCode, level - 1)
                                call BlzFrameSetVisible(TasSpellView_Cooldown[i], true)
                                call BlzFrameSetValue(TasSpellView_Cooldown[i], 100 - ( cdRemain / cdTotal ) * 100)
                            else
                                call BlzFrameSetVisible(TasSpellView_Cooldown[i], false)
                                call BlzFrameSetVisible(TasSpellView_TextCool[i], false)
                            endif
                        else
                            call BlzFrameSetVisible(TasSpellView_Cooldown[i], false)
                        endif
                        
                        call BlzFrameSetVisible(TasSpellView_OverLayFrame[i], true)
                        call BlzFrameSetText(TasSpellView_ChargeBoxText[i], I2S(level))
                        if not TasSpellView_TechFullFilled(GetOwningPlayer(u) , abiCode) then
                            call BlzFrameSetText(TasSpellView_ChargeBoxText[i], TasSpellView_TextDisallowed)
                        else
                            call BlzFrameSetText(TasSpellView_ChargeBoxText[i], I2S(level))
                        endif
                    endif

                    // hovered?
                    if not stillShowLastTooltip and not foundTooltip and BlzFrameIsVisible(TasSpellView_SimpleTooltip[i]) then
                        set foundTooltip=true
                        if i != TasSpellView_LastHoveredIndex then
                            set TasSpellView_LastHoveredIndex=i
                            call BlzFrameSetTexture(TasSpellView_TooltipIcon, TasSpellView_DataIcon[i], 0, false)
                            call BlzFrameSetText(TasSpellView_TooltipName, TasSpellView_DataName[i])
                            call BlzFrameSetText(TasSpellView_TooltipText, TasSpellView_DataText[i])
                            call BlzFrameSetText(TasSpellView_TooltipTextMana, TasSpellView_DataMana[i])
                            call BlzFrameSetText(TasSpellView_TooltipTextCool, TasSpellView_DataCool[i])
                            call BlzFrameSetText(TasSpellView_TooltipTextRange, TasSpellView_DataRange[i])
                            call BlzFrameSetText(TasSpellView_TooltipTextArea, TasSpellView_DataAoe[i])
                        endif
                    endif
                endif

                
                exitwhen i == 11
                set i=i + 1
            endloop
            call BlzFrameSetVisible(TasSpellView_Tooltip, stillShowLastTooltip or foundTooltip)
        endif
        set u=null
        set abi=null
    endfunction



    function TasSpellView_InitFramesCodeOnlyCreateButton takes integer i,framehandle simpleButton returns nothing
        local framehandle frame
        local framehandle buttonFrame
        local framehandle overlayFrame
        set buttonFrame=BlzCreateFrameByType("FRAME", "TasSpellViewButton", TasSpellView_Parent, "", i)
        set TasSpellView_Button[i]=buttonFrame
        call BlzFrameSetAllPoints(buttonFrame, simpleButton)
        set frame=BlzCreateFrameByType("BACKDROP", "TasSpellViewButtonBackdrop", buttonFrame, "", i)
        set TasSpellView_Icon[i]=frame
        call BlzFrameSetAllPoints(frame, simpleButton)
        set overlayFrame=BlzCreateFrameByType("FRAME", "TasSpellViewButtonOverLayFrame", buttonFrame, "", i)
        call BlzFrameSetAllPoints(frame, simpleButton)
        set TasSpellView_OverLayFrame[i]=overlayFrame
        set frame=BlzCreateFrameByType("TEXT", "TasSpellViewButtonTextOverLay", overlayFrame, "", i)
        set TasSpellView_OverLayText[i]=frame
        set frame=BlzCreateFrameByType("BACKDROP", "TasSpellViewButtonChargeBox", overlayFrame, "", i)
        set TasSpellView_ChargeBox[i]=frame
        call BlzFrameSetSize(frame, 0.02, 0.02)
        call BlzFrameSetTexture(frame, "UI/Widgets/Console/Human/CommandButton/human-button-lvls-overlay.blp", 0, true)
        call BlzFrameSetPoint(frame, FRAMEPOINT_BOTTOMRIGHT, simpleButton, FRAMEPOINT_BOTTOMRIGHT, 0.005, - 0.005)
        set frame=BlzCreateFrameByType("TEXT", "TasSpellViewButtonChargeText", overlayFrame, "", i)
        set TasSpellView_ChargeBoxText[i]=frame
        call BlzFrameSetSize(frame, 0.02, 0.02)
        call BlzFrameSetPoint(frame, FRAMEPOINT_BOTTOMRIGHT, simpleButton, FRAMEPOINT_BOTTOMRIGHT, 0.005, - 0.005)
        call BlzFrameSetTextAlignment(frame, TEXT_JUSTIFY_CENTER, TEXT_JUSTIFY_MIDDLE)
        set frame=BlzCreateFrameByType("STATUSBAR", "TasSpellViewButtonCooldown", overlayFrame, "", i)
        set TasSpellView_Cooldown[i]=frame
        call BlzFrameSetModel(frame, "UI/Feedback/Cooldown/UI-Cooldown-Indicator.mdl", 0)
        call BlzFrameSetAllPoints(frame, simpleButton)
        call BlzFrameSetVisible(frame, false)
        set frame=BlzCreateFrameByType("TEXT", "TasSpellViewButtonCooldownText", frame, "TeamLadderRankValueTextTemplate", i)
        set TasSpellView_TextCool[i]=frame
        call BlzFrameSetAllPoints(frame, simpleButton)
        call BlzFrameSetTextAlignment(frame, TEXT_JUSTIFY_CENTER, TEXT_JUSTIFY_MIDDLE)
    endfunction

    function TasSpellView_InitFramesCodeOnly takes nothing returns nothing
        local integer i
        local framehandle frame
        local framehandle frameB
        local framehandle tooltipFrame
        
        set TasSpellView_ParentSimple=BlzCreateFrameByType("SIMPLEFRAME", "TasSpellViewSimpleFrame", TasSpellView_ParentFuncSimple(), "", 0)
        set TasSpellView_Parent=BlzCreateFrameByType("FRAME", "TasSpellViewFrame", (BlzGetOriginFrame(ORIGIN_FRAME_GAME_UI, 0)), "", 0) // INLINED!!
        set i=0
        loop
            //set frame = BlzCreateSimpleFrame("TasSpellViewButton", ParentSimple, i)
            set frame=BlzCreateFrameByType("SIMPLEBUTTON", "TasSpellViewButtonCode", TasSpellView_ParentSimple, "UpperButtonBarButtonTemplate", i)
            set TasSpellView_SimpleButton[i]=frame
            call BlzFrameSetPoint(frame, FRAMEPOINT_CENTER, BlzGetOriginFrame(ORIGIN_FRAME_COMMAND_BUTTON, i), FRAMEPOINT_CENTER, 0, 0.0)
            call BlzFrameSetSize(frame, 0.034, 0.034)
            call BlzFrameSetLevel(frame, 6) // reforged stuff
            call BlzFrameSetAlpha(frame, 0)
            set tooltipFrame=BlzCreateFrameByType("SIMPLEFRAME", "TasSpellViewButtonToolTip", frame, "", i)
            call BlzFrameSetTooltip(frame, tooltipFrame)
            call BlzFrameSetVisible(tooltipFrame, false)
            set TasSpellView_SimpleTooltip[i]=tooltipFrame

            call TasSpellView_InitFramesCodeOnlyCreateButton(i , frame)

            set i=i + 1
            exitwhen i > 11
        endloop

        // create one ToolTip which shows data for current hovered inside a timer.
        // also reserve handleIds to allow async usage
        set tooltipFrame=BlzCreateFrameByType("FRAME", "TasSpellViewTooltipFrame", TasSpellView_Parent, "", 0)
        set TasSpellView_Tooltip=tooltipFrame
        //set frame = BlzCreateFrameByType("BACKDROP", "TasSpellViewTooltipBox", tooltipFrame, "QuestButtonDisabledBackdropTemplate", 0)
        set frame=BlzCreateFrameByType("FRAME", "TasSpellViewTooltipBox", tooltipFrame, "Leaderboard", 0)
        set TasSpellView_TooltipBox=frame

        set frame=BlzCreateFrameByType("BACKDROP", "TasSpellViewTooltipIcon", tooltipFrame, "", 0)
        set TasSpellView_TooltipIcon=frame
        call BlzFrameSetSize(frame, 0.035, 0.035)

        set frame=BlzCreateFrameByType("TEXT", "TasSpellViewTooltipName", tooltipFrame, "TeamValueTextTemplate", 0)
        set TasSpellView_TooltipName=frame
        call BlzFrameSetTextAlignment(frame, TEXT_JUSTIFY_CENTER, TEXT_JUSTIFY_MIDDLE)

        set frame=BlzCreateFrameByType("BACKDROP", "TasSpellViewTooltipSeperator", tooltipFrame, "", 0)
        set TasSpellView_TooltipSep=frame
        call BlzFrameSetSize(frame, 0, 0.001)
        call BlzFrameSetTexture(frame, "replaceabletextures/teamcolor/teamcolor08", 0, false)
        set frame=BlzCreateFrameByType("TEXT", "TasSpellViewTooltipText", tooltipFrame, "TeamValueTextTemplate", 0)
        set TasSpellView_TooltipText=frame

        set frame=BlzCreateFrameByType("BACKDROP", "TasSpellViewTooltipManaIcon", tooltipFrame, "", 0)
        call BlzFrameSetTexture(frame, "UI/Widgets/ToolTips/Human/ToolTipManaIcon.blp", 0, false)
        call BlzFrameSetSize(frame, 0.015, 0.015)
        set frame=BlzCreateFrameByType("TEXT", "TasSpellViewTooltipManaText", tooltipFrame, "TeamValueTextTemplate", 0)
        set TasSpellView_TooltipTextMana=frame
        call BlzFrameSetPoint(frame, FRAMEPOINT_LEFT, BlzGetFrameByName("TasSpellViewTooltipManaIcon", 0), FRAMEPOINT_RIGHT, 0.005, 0)

        set frame=BlzCreateFrameByType("BACKDROP", "TasSpellViewTooltipCooldownIcon", tooltipFrame, "", 0)
        call BlzFrameSetSize(frame, 0.015, 0.015)
        call BlzFrameSetPoint(frame, FRAMEPOINT_LEFT, BlzGetFrameByName("TasSpellViewTooltipManaIcon", 0), FRAMEPOINT_RIGHT, 0.042, 0)
        call BlzFrameSetTexture(frame, "ui/widgets/battlenet/bnet-tournament-clock", 0, false)

        set frame=BlzCreateFrameByType("TEXT", "TasSpellViewTooltipCooldownText", tooltipFrame, "TeamValueTextTemplate", 0)
        set TasSpellView_TooltipTextCool=frame
        call BlzFrameSetPoint(frame, FRAMEPOINT_LEFT, BlzGetFrameByName("TasSpellViewTooltipCooldownIcon", 0), FRAMEPOINT_RIGHT, 0.005, 0)

        set frame=BlzCreateFrameByType("BACKDROP", "TasSpellViewTooltipRangeIcon", tooltipFrame, "", 0)
        call BlzFrameSetSize(frame, 0.015, 0.015)
        call BlzFrameSetPoint(frame, FRAMEPOINT_LEFT, BlzGetFrameByName("TasSpellViewTooltipCooldownIcon", 0), FRAMEPOINT_RIGHT, 0.042, 0)
        call BlzFrameSetTexture(frame, "replaceabletextures/commandbuttons/btnload", 0, false)

        set frame=BlzCreateFrameByType("TEXT", "TasSpellViewTooltipRangeText", tooltipFrame, "TeamValueTextTemplate", 0)
        set TasSpellView_TooltipTextRange=frame
        call BlzFrameSetPoint(frame, FRAMEPOINT_LEFT, BlzGetFrameByName("TasSpellViewTooltipRangeIcon", 0), FRAMEPOINT_RIGHT, 0.005, 0)

        set frame=BlzCreateFrameByType("BACKDROP", "TasSpellViewTooltipAreaIcon", tooltipFrame, "", 0)
        call BlzFrameSetSize(frame, 0.015, 0.015)
        call BlzFrameSetPoint(frame, FRAMEPOINT_LEFT, BlzGetFrameByName("TasSpellViewTooltipRangeIcon", 0), FRAMEPOINT_RIGHT, 0.042, 0)
        call BlzFrameSetTexture(frame, "replaceabletextures/selection/spellareaofeffect_undead", 0, true)

        set frame=BlzCreateFrameByType("TEXT", "TasSpellViewTooltipAreaText", tooltipFrame, "TeamValueTextTemplate", 0)
        set TasSpellView_TooltipTextArea=frame
        call BlzFrameSetPoint(frame, FRAMEPOINT_LEFT, BlzGetFrameByName("TasSpellViewTooltipAreaIcon", 0), FRAMEPOINT_RIGHT, 0.005, 0)
        

        call BlzFrameSetPoint(BlzGetFrameByName("TasSpellViewTooltipManaIcon", 0), FRAMEPOINT_BOTTOMLEFT, TasSpellView_TooltipSep, FRAMEPOINT_TOPLEFT, 0, 0.005)

        call BlzFrameSetPoint(TasSpellView_TooltipSep, FRAMEPOINT_BOTTOMLEFT, TasSpellView_TooltipText, FRAMEPOINT_TOPLEFT, 0, 0.005)
        call BlzFrameSetPoint(TasSpellView_TooltipSep, FRAMEPOINT_BOTTOMRIGHT, TasSpellView_TooltipText, FRAMEPOINT_TOPRIGHT, 0, 0.005)

        call BlzFrameSetPoint(TasSpellView_TooltipName, FRAMEPOINT_TOPLEFT, TasSpellView_TooltipIcon, FRAMEPOINT_TOPRIGHT, 0.005, - 0.002)
        call BlzFrameSetPoint(TasSpellView_TooltipName, FRAMEPOINT_BOTTOMRIGHT, TasSpellView_TooltipSep, FRAMEPOINT_TOPRIGHT, - 0.005, 0.021)

        call BlzFrameSetPoint(TasSpellView_TooltipIcon, FRAMEPOINT_BOTTOMLEFT, TasSpellView_TooltipSep, FRAMEPOINT_TOPLEFT, 0, 0.021)

        call BlzFrameSetSize(TasSpellView_TooltipText, TasSpellView_ToolTipSizeX, 0)
        call BlzFrameSetAbsPoint(TasSpellView_TooltipText, TasSpellView_ToolTipPos, TasSpellView_ToolTipPosX, TasSpellView_ToolTipPosY)
        call BlzFrameSetPoint(TasSpellView_TooltipBox, FRAMEPOINT_TOPLEFT, TasSpellView_TooltipIcon, FRAMEPOINT_TOPLEFT, - 0.009, 0.009)
        call BlzFrameSetPoint(TasSpellView_TooltipBox, FRAMEPOINT_BOTTOMRIGHT, TasSpellView_TooltipText, FRAMEPOINT_BOTTOMRIGHT, 0.009, - 0.009)
        call BlzFrameSetVisible(TasSpellView_Tooltip, false)

        call BlzFrameSetVisible(TasSpellView_ParentSimple, false)
        call BlzFrameSetVisible(TasSpellView_Parent, false)
    endfunction

    function TasSpellView_InitFrames takes nothing returns nothing
        local integer i
        local framehandle frame
        local framehandle tooltipFrame
        if not BlzLoadTOCFile(TasSpellView_TocPath) then
            call BJDebugMsg("|cffff0000TasSpellView - Error Reading Toc File at: " + TasSpellView_TocPath)
        endif
        set TasSpellView_ParentSimple=BlzCreateFrameByType("SIMPLEFRAME", "TasSpellViewSimpleFrame", TasSpellView_ParentFuncSimple(), "", 0)
        set TasSpellView_Parent=BlzCreateFrameByType("FRAME", "TasSpellViewFrame", (BlzGetOriginFrame(ORIGIN_FRAME_GAME_UI, 0)), "", 0) // INLINED!!
        set i=0
        loop
            set frame=BlzCreateSimpleFrame("TasSpellViewButton", TasSpellView_ParentSimple, i)
            set TasSpellView_SimpleButton[i]=frame
            set TasSpellView_Button[i]=frame
            call BlzFrameSetPoint(frame, FRAMEPOINT_CENTER, BlzGetOriginFrame(ORIGIN_FRAME_COMMAND_BUTTON, i), FRAMEPOINT_CENTER, 0, 0.0)
            call BlzFrameSetLevel(frame, 6) // reforged stuff
            set TasSpellView_OverLayFrame[i]=BlzGetFrameByName("TasSpellViewButtonOverLayFrame", i)
            call BlzFrameSetLevel(TasSpellView_OverLayFrame[i], 7) // reforged stuff
            set tooltipFrame=BlzCreateFrameByType("SIMPLEFRAME", "TasSpellViewButtonToolTip", frame, "", i)
            call BlzFrameSetTooltip(frame, tooltipFrame)
            call BlzFrameSetVisible(tooltipFrame, false)
            set TasSpellView_SimpleTooltip[i]=tooltipFrame

            set TasSpellView_Cooldown[i]=BlzCreateFrame("TasSpellViewButtonCooldown", TasSpellView_Parent, 0, i)

            call BlzFrameSetVisible(TasSpellView_Cooldown[i], false)
            // reserve HandleIds
            set TasSpellView_TextCool[i]=BlzGetFrameByName("TasSpellViewButtonCooldownText", i)
            set TasSpellView_Icon[i]=BlzGetFrameByName("TasSpellViewButtonBackdrop", i)
            set TasSpellView_OverLayText[i]=BlzGetFrameByName("TasSpellViewButtonTextOverLay", i)
            
            set TasSpellView_ChargeBox[i]=BlzGetFrameByName("TasSpellViewButtonChargeBox", i)
            set TasSpellView_ChargeBoxText[i]=BlzGetFrameByName("TasSpellViewButtonChargeText", i)
            set i=i + 1
            exitwhen i > 11
        endloop
        if GetHandleId(TasSpellView_Icon[1]) == 0 then
            call BJDebugMsg("|cffff0000TasSpellView - Error Create TasSpellViewButton|r")
            call BJDebugMsg("  Check Imported toc & fdf & TocPath in Map script")
            call BJDebugMsg("  Imported toc needs to have empty ending line")
            call BJDebugMsg("  fdf path in toc needs to match map imported path")
            call BJDebugMsg("  TocPath in Map script needs to match map imported path")
        endif
        
        // create one ToolTip which shows data for current hovered inside a timer.
        // also reserve handleIds to allow async usage
        set TasSpellView_Tooltip=BlzCreateFrame("TasSpellViewTooltipFrame", TasSpellView_Parent, 0, 0)
        set TasSpellView_TooltipBox=BlzGetFrameByName("TasSpellViewTooltipBox", 0)
        set TasSpellView_TooltipIcon=BlzGetFrameByName("TasSpellViewTooltipIcon", 0)
        set TasSpellView_TooltipName=BlzGetFrameByName("TasSpellViewTooltipName", 0)
        set TasSpellView_TooltipSep=BlzGetFrameByName("TasSpellViewTooltipSeperator", 0)
        set TasSpellView_TooltipText=BlzGetFrameByName("TasSpellViewTooltipText", 0)
        set TasSpellView_TooltipTextMana=BlzGetFrameByName("TasSpellViewTooltipManaText", 0)
        set TasSpellView_TooltipTextCool=BlzGetFrameByName("TasSpellViewTooltipCooldownText", 0)
        set TasSpellView_TooltipTextRange=BlzGetFrameByName("TasSpellViewTooltipRangeText", 0)
        set TasSpellView_TooltipTextArea=BlzGetFrameByName("TasSpellViewTooltipAreaText", 0)

        call BlzFrameSetSize(TasSpellView_TooltipText, TasSpellView_ToolTipSizeX, 0)
        call BlzFrameSetAbsPoint(TasSpellView_TooltipText, TasSpellView_ToolTipPos, TasSpellView_ToolTipPosX, TasSpellView_ToolTipPosY)
        call BlzFrameSetPoint(TasSpellView_TooltipBox, FRAMEPOINT_TOPLEFT, TasSpellView_TooltipIcon, FRAMEPOINT_TOPLEFT, - 0.005, 0.005)
        call BlzFrameSetPoint(TasSpellView_TooltipBox, FRAMEPOINT_BOTTOMRIGHT, TasSpellView_TooltipText, FRAMEPOINT_BOTTOMRIGHT, 0.005, - 0.005)
        call BlzFrameSetVisible(TasSpellView_Tooltip, false)

        
        call BlzFrameSetVisible(TasSpellView_ParentSimple, false)
        call BlzFrameSetVisible(TasSpellView_Parent, false)
        if GetHandleId(TasSpellView_Tooltip) == 0 then
            call BJDebugMsg("TasSpellView - Error - Create TasSpellViewTooltipFrame")
            call BJDebugMsg("Check Imported toc & fdf & TocPath")
        endif
    endfunction

    function TasSpellView_InitFramesPre takes nothing returns nothing
        if TasSpellView_TocPath == null or TasSpellView_TocPath == "" or not BlzLoadTOCFile(TasSpellView_TocPath) then
            call TasSpellView_InitFramesCodeOnly()
        else
            call TasSpellView_InitFrames()
        endif
    endfunction
    function InitSpellView takes nothing returns nothing
        set TasSpellView_Group=CreateGroup()
        set TasSpellView_Timer=CreateTimer()
        call TimerStart(TasSpellView_Timer, TasSpellView_UpdateTime, true, function TasSpellView_Update)
        call TasSpellView_InitFramesPre()



    endfunction

    function TasSpellView___init_function takes nothing returns nothing
        local real a= 5.1
        local integer i= 9999
        //reserve cooldown texts
        loop
            exitwhen i < 0
            set i=i - 1
            set a=a - 0.1
            call R2SW(a, 1, 1)
            call I2S(i)
        endloop

        if TasSpellView_AutoRun then
            call InitSpellView()
        endif
    endfunction

//library TasSpellView ends
//library TasSpellViewDemo:
function TasSpellViewDemo__init_function takes nothing returns nothing
call TasSpellView_AddTechReq('AHta' , 'Rhse' , 1)
call TasSpellView_AddTechReq('Acmg' , 'Rhss' , 1)
call TasSpellView_AddTechReq('Aflk' , 'Rhfc' , 1)
call TasSpellView_AddTechReq('Afsh' , 'Rhfs' , 1)
call TasSpellView_AddTechReq('Aroc' , 'Rhrt' , 1)
call TasSpellView_AddTechReq('Aclf' , 'Rhcd' , 1)
call TasSpellView_AddTechReq('Agyb' , 'Rhgb' , 1)
call TasSpellView_AddTechReq('Asth' , 'Rhhb' , 1)
call TasSpellView_AddTechReq('Adef' , 'Rhde' , 1)
call TasSpellView_AddTechReq('Afla' , 'Rhfl' , 1)
call TasSpellView_AddTechReq('Adts' , 'Rhse' , 1)
call TasSpellView_AddTechReq('Ainf' , 'Rhpt' , 2)
call TasSpellView_AddTechReq('Adis' , 'Rhpt' , 1)
call TasSpellView_AddTechReq('Aivs' , 'Rhst' , 1)
call TasSpellView_AddTechReq('Aply' , 'Rhst' , 2)
call TasSpellView_AddTechReq('Ahri' , 'Rhri' , 1)
call TasSpellView_AddTechReq('Ahan' , 'Rhan' , 1)
call TasSpellView_AddTechReq('Ahlh' , 'Rhlh' , 1)
call TasSpellView_AddTechReq('Aiun' , 'Rupm' , 1)
call TasSpellView_AddTechReq('Aion' , 'Ropm' , 1)
call TasSpellView_AddTechReq('Aihn' , 'Rhpm' , 1)
call TasSpellView_AddTechReq('Aien' , 'Repm' , 1)
call TasSpellView_AddTechReq('ACam' , 'Ruba' , 1)
call TasSpellView_AddTechReq('ACdm' , 'Resi' , 1)
call TasSpellView_AddTechReq('ACd2' , 'Resi' , 1)
call TasSpellView_AddTechReq('ACen' , 'Roen' , 1)
call TasSpellView_AddTechReq('Assk' , 'Rehs' , 1)
call TasSpellView_AddTechReq('Arsk' , 'Rers' , 1)
call TasSpellView_AddTechReq('Amgl' , 'Remg' , 1)
call TasSpellView_AddTechReq('Aesn' , 'Resc' , 1)
call TasSpellView_AddTechReq('Awhe' , 'Rewh' , 1)
call TasSpellView_AddTechReq('Abrf' , 'Redc' , 2)
call TasSpellView_AddTechReq('Arav' , 'Redt' , 1)
call TasSpellView_AddTechReq('Aadm' , 'Resi' , 1)
call TasSpellView_AddTechReq('Ault' , 'Reuv' , 1)
call TasSpellView_AddTechReq('Acoa' , 'ehip' , 1)
call TasSpellView_AddTechReq('Aco2' , 'ehip' , 1)
call TasSpellView_AddTechReq('Acoh' , 'ehip' , 1)
call TasSpellView_AddTechReq('Aco3' , 'ehip' , 1)
call TasSpellView_AddTechReq('Acor' , 'Recb' , 1)
call TasSpellView_AddTechReq('Afa2' , 'Reec' , 1)
call TasSpellView_AddTechReq('Acyc' , 'Redt' , 2)
call TasSpellView_AddTechReq('Arej' , 'Redc' , 1)
call TasSpellView_AddTechReq('Ara2' , 'Reeb' , 1)
call TasSpellView_AddTechReq('Aeib' , 'Reib' , 1)
call TasSpellView_AddTechReq('Aemk' , 'Remk' , 1)
call TasSpellView_AddTechReq('Aews' , 'Rews' , 1)
call TasSpellView_AddTechReq('Abof' , 'Robf' , 1)
call TasSpellView_AddTechReq('Absk' , 'Robk' , 1)
call TasSpellView_AddTechReq('Sbsk' , 'Robk' , 1)
call TasSpellView_AddTechReq('Aast' , 'Rowt' , 2)
call TasSpellView_AddTechReq('Adch' , 'Rowt' , 1)
call TasSpellView_AddTechReq('Adcn' , 'Rowt' , 1)
call TasSpellView_AddTechReq('Apak' , 'Ropm' , 1)
call TasSpellView_AddTechReq('Aliq' , 'Rolf' , 1)
call TasSpellView_AddTechReq('Acha' , 'Roch' , 1)
call TasSpellView_AddTechReq('Achl' , 'Roch' , 1)
call TasSpellView_AddTechReq('Sca1' , 'Roch' , 1)
call TasSpellView_AddTechReq('Sca2' , 'Roch' , 1)
call TasSpellView_AddTechReq('Sca3' , 'Roch' , 1)
call TasSpellView_AddTechReq('Sca4' , 'Roch' , 1)
call TasSpellView_AddTechReq('Sca5' , 'Roch' , 1)
call TasSpellView_AddTechReq('Sca6' , 'Roch' , 1)
call TasSpellView_AddTechReq('Aens' , 'Roen' , 1)
call TasSpellView_AddTechReq('Alsh' , 'Rost' , 1)
call TasSpellView_AddTechReq('Ablo' , 'Rost' , 2)
call TasSpellView_AddTechReq('Asta' , 'Rowd' , 1)
call TasSpellView_AddTechReq('Ahwd' , 'Rowd' , 2)
call TasSpellView_AddTechReq('Aven' , 'Rovs' , 1)
call TasSpellView_AddTechReq('Anit' , 'Ronv' , 1)
call TasSpellView_AddTechReq('Asal' , 'Ropg' , 1)
call TasSpellView_AddTechReq('Aobs' , 'Robs' , 1)
call TasSpellView_AddTechReq('Aobk' , 'Robk' , 1)
call TasSpellView_AddTechReq('Aorb' , 'Rorb' , 1)
call TasSpellView_AddTechReq('Aosp' , 'Rosp' , 1)
call TasSpellView_AddTechReq('Aotr' , 'Rotr' , 1)
call TasSpellView_AddTechReq('Aexh' , 'Ruex' , 1)
call TasSpellView_AddTechReq('Aave' , 'Rusp' , 1)
call TasSpellView_AddTechReq('Abur' , 'Rubu' , 1)
call TasSpellView_AddTechReq('Abu2' , 'Rubu' , 1)
call TasSpellView_AddTechReq('Abu3' , 'Rubu' , 1)
call TasSpellView_AddTechReq('Alam' , 'usap' , 1)
call TasSpellView_AddTechReq('Acan' , 'Ruac' , 1)
call TasSpellView_AddTechReq('Acn2' , 'Ruac' , 1)
call TasSpellView_AddTechReq('Aweb' , 'Ruwb' , 1)
call TasSpellView_AddTechReq('Astn' , 'Rusf' , 1)
call TasSpellView_AddTechReq('Aapl' , 'Rupc' , 1)
call TasSpellView_AddTechReq('Aap1' , 'Rupc' , 1)
call TasSpellView_AddTechReq('Aap2' , 'Rupc' , 1)
call TasSpellView_AddTechReq('Aap3' , 'Rupc' , 1)
call TasSpellView_AddTechReq('Aap4' , 'Rupc' , 1)
call TasSpellView_AddTechReq('Apts' , 'Rupc' , 1)
call TasSpellView_AddTechReq('Afrz' , 'Rufb' , 1)
call TasSpellView_AddTechReq('Auhf' , 'Rune' , 1)
call TasSpellView_AddTechReq('Auuf' , 'Rune' , 2)
call TasSpellView_AddTechReq('Aams' , 'Ruba' , 1)
call TasSpellView_AddTechReq('Aam2' , 'Ruba' , 1)
call TasSpellView_AddTechReq('Apos' , 'Ruba' , 2)
call TasSpellView_AddTechReq('Aps2' , 'Ruba' , 2)
call TasSpellView_AddTechReq('Acri' , 'Rune' , 2)
call TasSpellView_AddTechReq('Augf' , 'Rugf' , 1)
call TasSpellView_AddTechReq('Ausm' , 'Rusm' , 1)

call TasSpellView_AddUnitCodeData('uban' , "Aams,Acrs,Apos,Aiun")
call TasSpellView_AddUnitCodeData('ugho' , "Acan,Ahrl,Aiun")
call TasSpellView_AddUnitCodeData('unec' , "Acri,Arai,Auhf,Aiun")
    endfunction

//library TasSpellViewDemo ends
//===========================================================================
// 
// TasSpellView
// 
//   Warcraft III map script
//   Generated by the Warcraft III World Editor
//   Date: Fri Feb 13 17:38:25 2026
//   Map Author: Tasyen
// 
//===========================================================================

//***************************************************************************
//*
//*  Global Variables
//*
//***************************************************************************


function InitGlobals takes nothing returns nothing
endfunction

//***************************************************************************
//*
//*  Custom Script Code
//*
//***************************************************************************
//***************************************************************************
//*  TasSpellView vjass

//***************************************************************************
//*  Ascii
//***************************************************************************
//*  jass TechTest Melee

//***************************************************************************
//*
//*  Unit Creation
//*
//***************************************************************************

//===========================================================================
function CreateBuildingsForPlayer0 takes nothing returns nothing
    local player p= Player(0)
    local unit u
    local integer unitID
    local trigger t
    local real life

    set u=CreateUnit(p, 'ngme', - 576.0, - 832.0, 270.000)
endfunction

//===========================================================================
function CreateUnitsForPlayer0 takes nothing returns nothing
    local player p= Player(0)
    local unit u
    local integer unitID
    local trigger t
    local real life

    set u=CreateUnit(p, 'Hblm', - 641.4, - 1170.7, 315.087)
    set u=CreateUnit(p, 'hsor', - 560.3, - 1402.3, 166.635)
    set u=CreateUnit(p, 'Hamg', - 732.1, - 1358.5, 76.456)
    set u=CreateUnit(p, 'edot', - 664.8, - 1445.5, 217.536)
    set u=CreateUnit(p, 'edoc', - 781.3, - 1112.9, 179.061)
    set u=CreateUnit(p, 'emtg', - 530.2, - 1293.9, 212.559)
    set u=CreateUnit(p, 'efdr', - 675.6, - 1058.8, 174.281)
    set u=CreateUnit(p, 'edry', - 851.7, - 1334.3, 131.422)
    set u=CreateUnit(p, 'ugho', - 821.2, - 1483.4, 227.446)
    set u=CreateUnit(p, 'hmpr', - 977.8, - 1478.1, 165.305)
endfunction

//===========================================================================
function CreateBuildingsForPlayer1 takes nothing returns nothing
    local player p= Player(1)
    local unit u
    local integer unitID
    local trigger t
    local real life

    set u=CreateUnit(p, 'ngme', - 1024.0, - 832.0, 270.000)
endfunction

//===========================================================================
function CreateUnitsForPlayer1 takes nothing returns nothing
    local player p= Player(1)
    local unit u
    local integer unitID
    local trigger t
    local real life

    set u=CreateUnit(p, 'odoc', 790.6, - 570.1, 52.308)
    set u=CreateUnit(p, 'ospw', 1034.7, - 894.6, 312.790)
    set u=CreateUnit(p, 'oshm', 1207.0, - 1369.9, 234.258)
    set u=CreateUnit(p, 'ocat', 1053.9, - 601.4, 352.617)
    set u=CreateUnit(p, 'unec', 843.3, - 1225.6, 100.682)
    set u=CreateUnit(p, 'uban', 992.0, - 439.2, 85.971)
    set u=CreateUnit(p, 'unec', 869.0, - 754.4, 288.125)
    set u=CreateUnit(p, 'Ucrl', 974.7, - 1271.2, 330.630)
    call SetHeroLevel(u, 10, false)
    call SelectHeroSkill(u, 'AUim')
    call SelectHeroSkill(u, 'AUim')
    call SelectHeroSkill(u, 'AUts')
    call SelectHeroSkill(u, 'AUcb')
    call SelectHeroSkill(u, 'AUcb')
    call SelectHeroSkill(u, 'AUcb')
    call IssueImmediateOrder(u, "Carrionscarabsoff")
    call SelectHeroSkill(u, 'AUls')
    set u=CreateUnit(p, 'Ulic', 827.1, - 456.7, 100.690)
    call SetHeroLevel(u, 2, false)
    call SelectHeroSkill(u, 'AUfn')
    call SelectHeroSkill(u, 'AUfu')
    call IssueImmediateOrder(u, "frostarmoroff")
    set u=CreateUnit(p, 'h000', - 1170.9, - 528.4, 261.911)
    set u=CreateUnit(p, 'ugho', 1106.7, - 1290.2, 13.060)
    set u=CreateUnit(p, 'hmpr', 1193.7, - 1096.3, 137.048)
endfunction

//===========================================================================
function CreateNeutralHostile takes nothing returns nothing
    local player p= Player(PLAYER_NEUTRAL_AGGRESSIVE)
    local unit u
    local integer unitID
    local trigger t
    local real life

    set u=CreateUnit(p, 'nfsp', - 931.7, 512.4, 102.747)
    set u=CreateUnit(p, 'ngnw', - 729.0, 482.3, 288.378)
    set u=CreateUnit(p, 'nomg', - 332.8, 396.8, 288.741)
    set u=CreateUnit(p, 'nitp', - 261.1, 182.5, 309.714)
    set u=CreateUnit(p, 'nnwl', 329.5, 294.4, 50.044)
    set u=CreateUnit(p, 'nmrr', 221.3, 27.2, 130.335)
    set u=CreateUnit(p, 'Hmkg', 50.3, 580.3, 55.240)
    call SelectHeroSkill(u, 'AHbh')
endfunction

//===========================================================================
function CreateNeutralPassiveBuildings takes nothing returns nothing
    local player p= Player(PLAYER_NEUTRAL_PASSIVE)
    local unit u
    local integer unitID
    local trigger t
    local real life

    set u=CreateUnit(p, 'ngme', - 1024.0, - 1280.0, 270.000)
    set u=CreateUnit(p, 'nfoh', - 832.0, - 448.0, 270.000)
    set u=CreateUnit(p, 'nmoo', - 448.0, - 448.0, 270.000)
endfunction

//===========================================================================
function CreateNeutralPassive takes nothing returns nothing
    local player p= Player(PLAYER_NEUTRAL_PASSIVE)
    local unit u
    local integer unitID
    local trigger t
    local real life

    set u=CreateUnit(p, 'nfro', - 922.8, - 32.1, 315.537)
    set u=CreateUnit(p, 'nfro', - 633.1, - 95.0, 5.032)
    set u=CreateUnit(p, 'necr', - 274.6, - 225.0, 95.650)
    set u=CreateUnit(p, 'necr', - 156.0, - 374.1, 238.224)
    set u=CreateUnit(p, 'necr', - 55.5, - 520.7, 323.019)
    set u=CreateUnit(p, 'nech', 524.1, 432.2, 357.407)
    set u=CreateUnit(p, 'nech', 436.2, 636.2, 278.666)
endfunction

//===========================================================================
function CreatePlayerBuildings takes nothing returns nothing
    call CreateBuildingsForPlayer0()
    call CreateBuildingsForPlayer1()
endfunction

//===========================================================================
function CreatePlayerUnits takes nothing returns nothing
    call CreateUnitsForPlayer0()
    call CreateUnitsForPlayer1()
endfunction

//===========================================================================
function CreateAllUnits takes nothing returns nothing
    call CreateNeutralPassiveBuildings()
    call CreatePlayerBuildings()
    call CreateNeutralHostile()
    call CreateNeutralPassive()
    call CreatePlayerUnits()
endfunction

//***************************************************************************
//*
//*  Triggers
//*
//***************************************************************************

//===========================================================================
// Trigger: At 0s
//===========================================================================
function Trig_At_0s_Actions takes nothing returns nothing
    call FogEnableOff()
    call FogMaskEnableOff()
endfunction

//===========================================================================
function InitTrig_At_0s takes nothing returns nothing
    set gg_trg_At_0s=CreateTrigger()
    call TriggerRegisterTimerEventSingle(gg_trg_At_0s, 0.0)
    call TriggerAddAction(gg_trg_At_0s, function Trig_At_0s_Actions)
endfunction

//===========================================================================
// Trigger: At 0s Kopieren
//===========================================================================
function Trig_At_0s_Kopieren_Actions takes nothing returns nothing
    call SetPlayerTechResearchedSwap('Ruac', 1, Player(1))
    call SetPlayerTechResearchedSwap('Ruba', 1, Player(1))
    call SetPlayerTechResearchedSwap('Rune', 2, Player(1))
endfunction

//===========================================================================
function InitTrig_At_0s_Kopieren takes nothing returns nothing
    set gg_trg_At_0s_Kopieren=CreateTrigger()
    call TriggerRegisterPlayerEventEndCinematic(gg_trg_At_0s_Kopieren, Player(0))
    call TriggerAddAction(gg_trg_At_0s_Kopieren, function Trig_At_0s_Kopieren_Actions)
endfunction

//===========================================================================
function InitCustomTriggers takes nothing returns nothing
    call InitTrig_At_0s()
    call InitTrig_At_0s_Kopieren()
endfunction

//***************************************************************************
//*
//*  Players
//*
//***************************************************************************

function InitCustomPlayerSlots takes nothing returns nothing

    // Player 0
    call SetPlayerStartLocation(Player(0), 0)
    call SetPlayerColor(Player(0), ConvertPlayerColor(0))
    call SetPlayerRacePreference(Player(0), RACE_PREF_HUMAN)
    call SetPlayerRaceSelectable(Player(0), true)
    call SetPlayerController(Player(0), MAP_CONTROL_USER)

    // Player 1
    call SetPlayerStartLocation(Player(1), 1)
    call SetPlayerColor(Player(1), ConvertPlayerColor(1))
    call SetPlayerRacePreference(Player(1), RACE_PREF_ORC)
    call SetPlayerRaceSelectable(Player(1), true)
    call SetPlayerController(Player(1), MAP_CONTROL_USER)

endfunction

function InitCustomTeams takes nothing returns nothing
    // Force: TRIGSTR_006
    call SetPlayerTeam(Player(0), 0)
    call SetPlayerTeam(Player(1), 0)

endfunction

function InitAllyPriorities takes nothing returns nothing

    call SetStartLocPrioCount(0, 1)
    call SetStartLocPrio(0, 0, 1, MAP_LOC_PRIO_HIGH)

    call SetStartLocPrioCount(1, 1)
    call SetStartLocPrio(1, 0, 0, MAP_LOC_PRIO_HIGH)
endfunction

//***************************************************************************
//*
//*  Main Initialization
//*
//***************************************************************************

//===========================================================================
function main takes nothing returns nothing
    call SetCameraBounds(- 1280.0 + GetCameraMargin(CAMERA_MARGIN_LEFT), - 1536.0 + GetCameraMargin(CAMERA_MARGIN_BOTTOM), 1280.0 - GetCameraMargin(CAMERA_MARGIN_RIGHT), 1024.0 - GetCameraMargin(CAMERA_MARGIN_TOP), - 1280.0 + GetCameraMargin(CAMERA_MARGIN_LEFT), 1024.0 - GetCameraMargin(CAMERA_MARGIN_TOP), 1280.0 - GetCameraMargin(CAMERA_MARGIN_RIGHT), - 1536.0 + GetCameraMargin(CAMERA_MARGIN_BOTTOM))
    call SetDayNightModels("Environment\\DNC\\DNCLordaeron\\DNCLordaeronTerrain\\DNCLordaeronTerrain.mdl", "Environment\\DNC\\DNCLordaeron\\DNCLordaeronUnit\\DNCLordaeronUnit.mdl")
    call NewSoundEnvironment("Default")
    call SetAmbientDaySound("LordaeronSummerDay")
    call SetAmbientNightSound("LordaeronSummerNight")
    call SetMapMusic("Music", true, 0)
    call CreateAllUnits()
    call InitBlizzard()

call ExecuteFunc("jasshelper__initstructs14345390")
call ExecuteFunc("TasSpellView___init_function")
call ExecuteFunc("TasSpellViewDemo__init_function")

    call InitGlobals()
    call InitCustomTriggers()

endfunction

//***************************************************************************
//*
//*  Map Configuration
//*
//***************************************************************************

function config takes nothing returns nothing
    call SetMapName("TRIGSTR_001")
    call SetMapDescription("TRIGSTR_003")
    call SetPlayers(2)
    call SetTeams(2)
    call SetGamePlacement(MAP_PLACEMENT_TEAMS_TOGETHER)

    call DefineStartLocation(0, - 576.0, - 1280.0)
    call DefineStartLocation(1, 896.0, - 896.0)

    // Player setup
    call InitCustomPlayerSlots()
    call SetPlayerSlotAvailable(Player(0), MAP_CONTROL_USER)
    call SetPlayerSlotAvailable(Player(1), MAP_CONTROL_USER)
    call InitGenericPlayerSlots()
    call InitAllyPriorities()
endfunction




//Struct method generated initializers/callers:

function jasshelper__initstructs14345390 takes nothing returns nothing

call ExecuteFunc("s__Ascii__Inits_Ascii__Init___onInit")

endfunction

