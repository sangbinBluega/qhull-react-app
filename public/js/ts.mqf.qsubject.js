////////////////////////////////////////////////////////////////////////////////
//  tsQsbjTool

window.tsQsbjTool = window.tsQsbjTool || {_cfg:{}}

/*  storage
        ...
    resolver
        ...
    listener
        sensor
    api
        stSubjectToQ
    tree
        bootStrap {} <- Tree의 상단 구조
    ui
        qsetRatio: Float, Qset 실행창 Ratio. 가로 기준 세로 비율. 없으면 저작기의 기본값으로 그냥 표시
        title: String, TOOL 명칭
*/
tsQsbjTool.set = function(/*String*/group, /*String*/key, value)
{
    this._cfg[group] = this._cfg[group] || {};
    this._cfg[group][key] = value;
}

tsQsbjTool.get = function(/*String*/group, /*String*/key)/*Value|undefined*/
{
    if (this._cfg[group]) return this._cfg[group][key];
}

tsQsbjTool.init = function(onSucc, onErr)
{
    //  보안 목적으로 Resolver를 LOG에 표시할 때, 뒤의 2개만 표시도록 함
    function cutResolver(str)
    {
        if (str){
            var str = str.split('/');

            return "'" + (str.length > 1 ? str[str.length-2]+'/'+str[str.length-1] : str[0]) + "'";
        }
    }

    var _this = this;

    //  사전과 사전GROUP이 로딩되면 주제로 변환함
    var workCntAll = 4, workCnt = 0;

    function processDict()
    {
        workCnt ++;

        if (workCnt == workCntAll){
            var log = '';

            if (_this.subject) log += (log?'\n':'') + 'Subject is loaded from '+ cutResolver(_this._cfg.resolver.subject.call(_this));
            if (_this.dict) log += (log?'\n':'') + 'Dict is loaded from '+ cutResolver(_this._cfg.resolver.dict.call(_this));
            if (_this.dictGroup) log += (log?'\n':'') + 'DictGroup is loaded from '+ cutResolver(_this._cfg.resolver.dictGroup.call(_this));
            if (_this.phrase) log += (log?'\n':'') + 'Phrase is loaded from '+ cutResolver(_this._cfg.resolver.phrase.call(_this));
            if (_this.course) log += (log?'\n':'') + 'Course is loaded from '+ cutResolver(_this._cfg.resolver.course.call(_this));
            if (_this.mapSentenceToDict) log += (log?'\n':'') + 'SentenceToDict is loaded.';
            if (_this.mapSubjectToQ) log += (log?'\n':'') + 'SubjectToQ is loaded.';
            if (log) tsPando.log.call(_this, 0, log);

            //  단어와 단어GROUP을 주제에 병합
            tsPando.subjectFromDict.call(_this, _this.subject, _this.dict, _this.dictGroup);
        
            //  Phrase를 주제에 병합
            _this.phraseWord = tsPando.subjectFromPhrase.call(_this, _this.subject, _this.phrase);

            //  Graph Loop Check
            var loop = tsPando.graphCheckLoop(_this.subject);
            
            if (loop.unknown){
                tsPando.log.call(_this, 2, 'Subject - Unknown. '+loop.unknown); //%%검증
            }

            if (loop.cycled){
                if (onErr) onErr(2, 'Subject - Graph cycled. '+loop.cycled);
                return;
            }

            //  주제 검증
            if (_this.subject){
                _this.subjectVerify();
            }

            //  주제의 문항 구성 정보
            _this.mapSubjectToQ_collected = tsPando.subjectCollectQ(_this.subject, _this.mapSubjectToQ);
            
            //  Subject가 모두 로딩되면 같이 검증
            if (_this.mapSubjectToQ){
                _this.s2qVerify();
            }

            if (_this.mapSubjectToLesson){
                for(var i in _this.mapSubjectToLesson.goal){
                    if (!_this.subject[i]){
                        tsPando.log.call(_this, 2, 'SubjectToLesson - Unknown Subject='+i+' in Course.'); //%%검증
                    }
                }
            }

            //  문장 INDEX 또는 구문이 있으면, 단어를 검증함
            if (_this.mapSentenceToDict || _this.phraseWord || _this.dictGroup){
                _this.dictVerify();
            }

            //  주제에 대한 문항 현황 검증. mapSubjectToLesson 이후에 호출함
            _this.s2qStVerify();

            //  TOOL이 핸들하기 쉬운 TREE 구조로 변경
            _this.tree = _this._toTree(_this.subject);

            if (onSucc) onSucc();
        }
    }

    //  주제 로딩
    this._cfg.storage.subject.call(this, /*all*/undefined
        ,function (/*{}*/subject){
            _this.subject = subject;
            processDict();
        }
        ,function(err){
            if (onErr) onErr(2, 'Subject - Storage error from '+ cutResolver(_this._cfg.resolver.subject.call(_this)));
        }
    );

    //  사전 로딩 - 주제 변환을 위함
    _this._cfg.storage.dict.call(_this, /*all*/undefined
        ,function (key, /*{}*/dict){
            _this.dict = dict;

            //  사전의 교차 검증을 위하여, 문장 INDEX를 로딩함
            //  주제-TO-Q MAP 로딩 - 없는 경우도 있을 수 있음
            if (_this._cfg.api.stSentenceIndex){
                _this._cfg.api.stSentenceIndex.call(_this, /*all*/undefined
                    ,function (/*{}*/data){
                        _this.mapSentenceToDict = data;
                        processDict();
                    }
                    ,function(err){
                        processDict(); // 없을 경우도 있음. TOOL에서 생성함
                    }
                );
            }
            else{
                processDict();
            }
        }
        ,function(err){
            if (onErr) onErr(2, 'Dict - Storage error from '+ cutResolver(_this._cfg.resolver.dict.call(_this)));
        }
    );

    //  사전 GROUP 로딩 - 주제 변환을 위함
    _this._cfg.storage.dictGroup.call(_this, /*all*/undefined
        ,function (key, /*{}*/dictGroup){
            _this.dictGroup = dictGroup;
            processDict();
        }
        ,function(err){
            if (onErr) onErr(2, 'DictGroup - Storage error from '+ cutResolver(_this._cfg.resolver.dictGroup.call(_this)));
        }
    );

    //  Phrase 로딩 - 주제 변환을 위함
    if (_this._cfg.storage.phrase){
        workCntAll ++;
        _this._cfg.storage.phrase.call(_this, /*all*/undefined
            ,function (key, /*{}*/phrase){
                _this.phrase = phrase;
                processDict();
            }
            ,function(err){
                if (onErr) onErr(2, 'Phrase - Storage error from '+ cutResolver(_this._cfg.resolver.phrase.call(_this)));
            }
        );
    }

    //  주제-TO-Q MAP 로딩 - 없는 경우도 있을 수 있음
    _this._cfg.api.stSubjectToQ.call(_this, /*all*/undefined
        ,function (key, /*{}*/data){
            _this.mapSubjectToQ = data;
            processDict();
        }
        ,function(err){
            processDict(); // 없을 경우도 있음. TOOL에서 생성함
        }
    );

    //  코스 로딩 - 코스에 걸린 주제 정보 파악 (1) GOAL, (2) 규격외 서비스 정보 모듈 (3) QSET에 의한 Q 
    if (this._cfg.storage.course){
        workCntAll ++;
        this._cfg.storage.course.call(_this
            ,function (/*{}*/course){
                _this.course = course;
                _this.mapSubjectToLesson = tsPando.courseGetSubject(course);
                processDict();
            }
            ,function(err){
                if (onErr) onErr(2, 'Course - Storage error from '+ cutResolver(_this._cfg.resolver.course.call(_this)));
            }
        );
    }

    //  Listener-sensor
    window.addEventListener('message', function(ev){
        if (!(_this._cfg.listener && _this._cfg.listener.sensor)) return;
        if (!(ev.data && ev.data.pando)) return;

        tsPando.toConsole.call(_this, ev.data.pando, function(msg){
            _this._cfg.listener.sensor.call(_this, msg);
        });
    }, false);
}


////////////////////////////////////////////////////////////////////////////////////
//  Subject

//  주제를 검증함. 특히 child나 relative에 없는 주제가 Link될 수 있음
tsQsbjTool.subjectVerify = function()
{
    var buf;
    var dangled = {};

    for(var id in this.subject){
        buf = this.subject[id];

        if (buf.child){
            for(var i = 0; i < buf.child.length; i ++){
                if (!this.subject[buf.child[i]]) dangled[buf.child[i]] = true;
            }
        }
        if (buf.relative){
            for(var i = 0; i < buf.relative.length; i ++){
                if (!this.subject[buf.relative[i]]) dangled[buf.relative[i]] = true;
            }
        }
    }

    for(var i in dangled){
        tsPando.log.call(this, 2, 'Subject - Unknown Subject='+i+' is linked as \'child\' or \'relative\'.'); //%%검증
    }
}

/*  주제에 대하여 표시할 정보를 모두 정리함. TOOL에서 주제 정보를 표시하기 위한 것임
    _shortForm
        true, 일부만 취합하여 Return함. 이것은 목록 등에서 간단하게 보이기 위한 용도임
*/
tsQsbjTool.subjectGetInfo = function(sbjId)/*{}*/
{
    var ret = {};

    if (!this.subject) return ret;

    ret.info = {};
    ret.info.title = this.subject[sbjId].title;
    ret.info.difficulty = this.subject[sbjId].difficulty;
    ret.info.category = this.subject[sbjId].category;

    //  '단어'인 경우
    if (sbjId.indexOf('dict:') == 0 && sbjId.indexOf('dict::') == -1){
        var word = sbjId.substring(5);
        var dictItem;

        if (dictItem = tsPando.dictLookup(this.dict, word)){
            ret.word = dictItem;
        }
        else{
            //  이미 Warning이 dictVerify에서 발생함
        }
    }

    //  문항
    if (this.subject && this.mapSubjectToQ_collected && this.mapSubjectToQ_collected[sbjId]){
       ret.q = this.mapSubjectToQ_collected[sbjId];
    }

    //  차시목표 (서비스 정보도 포함됨)
    if (this.mapSubjectToLesson && this.mapSubjectToLesson.goal[sbjId]){
        ret.goal = this.mapSubjectToLesson.goal[sbjId];
    }

    return ret;
}

/*  주제가 지원하는 문항의 정보. TOOL에서 주제 목록 등에 표시할 수 있도록 정리해서 Return함
    [{tip:String,count:Number},...]
    편집 문항에 해당하는 1,2,3은 항상 생성함
*/
tsQsbjTool.subjectDictateQinfo = function(/*{1:[],...}*/infoQ)
{
    var tip = {1:'고정', 2:'은행', 3:'종속', 'word':'단어', 'compoundWord':'복합단어', 'phrase':'구문', 'phonics':'파닉스'};
    var ret = [];

    for(var i = 1; i <= 3; i ++){
        ret.push({tip:tip[i], count:(infoQ&&infoQ[i]?infoQ[i].length:0), list:(infoQ&&infoQ[i]?infoQ[i]:undefined)})
    }

    if (infoQ){ // 'word' 등 나머지
        for(i in infoQ){
            if (!(i=='1'||i=='2'||i=='3')){
                ret.push({tip:tip[i], count:infoQ[i]?infoQ[i].length:0, list:infoQ[i]})
            }
        }
    }

    return ret;
}

tsQsbjTool.subjectDictate = function(sbjId)/*HTML*/
{
    //  2컬럼짜리 <TR>을 생성함
    function genRow2(title, value, noEscape)/*HTML*/
    {
        return '<tr><td style="width:100px;">'+escapeHTML(title)+'</td><td>'+(noEscape ? value : escapeHTML(value))+'</td></tr>';
    }

    //  2컬럼짜리 Header용 <TABLE>
    function genHader2(title)/*HTML*/
    {
        return '<table style="border-bottom:none;"><tr style="border-bottom:none;"><th style="border-bottom:none;" colspan="2">'+escapeHTML(title)+'</th></tr></table>';
    }
    
    var lnTitle = {ko:{ko:'한국어', en:'Korean'}, en:{ko:'영어', en:'English'}, zh:{ko:'중국어', en:'Chinese'}, ja:{ko:'일본어', en:'Japanese'}, es:{ko:'스페인어', en:'Spanish'}, de:{ko:'독일어', en:'German'}, fr:{ko:'프랑스어', en:'French'}, ar:{ko:'아랍어', en:'Arabic'}, vi:{ko:'베트남어', en:'Vietnamese'}};
    var sbjInfo = tsQsbjTool.subjectGetInfo(sbjId);
    var html = '';

    //  일반 정보
    if (sbjInfo.word){
        //  'colspan' 상태에서 Table column 간격 조정이 잘 되지 않아서 이 경우 TABLE을 분리함
        html += genHader2('등록 정보');
        html += '<table>';
        
        if (sbjInfo.info.title){
            html += genRow2('단어', sbjInfo.info.title)
        }

        //  번역
        if (sbjInfo.word.ln){
            for(var i in sbjInfo.word.ln){ console.error(i)
                if (lnTitle[i]){ // 지원할 언어이면
                    html += genRow2(lnTitle[i].ko, sbjInfo.word.ln[i]);
                }
            }
        }

        if (sbjInfo.word.service){
            var astResolver = tsQsbjTool.get('resolver', 'asset');

            //  이미지
            if (sbjInfo.word.service.image && astResolver){
                var htmlImg = '';

                for(var i = 0; i < sbjInfo.word.service.image.length; i ++){
                    htmlImg += (htmlImg?' ':'') + '<img src="'+astResolver(tsQsbjTool._cfg, 'I', sbjInfo.word.service.image[i])+'" style="max-width:30%;margin-top:4px;"/>';
                }
                html += genRow2('이미지', htmlImg, true)
            }

            //  오디오
            if (sbjInfo.word.service.audio && astResolver){
                var buf, htmlAudio = '';

                for(var i = 0; i < sbjInfo.word.service.audio.length; i ++){
                    buf = sbjInfo.word.service.audio[i];

                    if (buf && buf.id){
                        htmlAudio += (htmlAudio?' ':'') + '<audio src="'+astResolver(tsQsbjTool._cfg, 'A', buf.id)+'" controls controlslist="nodownload" style="width:100%;margin-top:4px;" title="'+buf.type+'"></audio>';
                    }
                }
                if (htmlAudio) html += genRow2('오디오', htmlAudio, true)
            }
        }
        html += '</table>';
    }
    else if (sbjInfo.info){
        //  'colspan' 상태에서 Table column 간격 조정이 잘 되지 않아서 이 경우 TABLE을 분리함
        html += genHader2('등록 정보');
        html += '<table>';
        
        if (sbjInfo.info.title){
            html += genRow2('제목', sbjInfo.info.title)
        }
        
        if (sbjInfo.info.titleShort){
            html += genRow2('제목-요약', sbjInfo.info.titleShort)
        }
        
        if (sbjInfo.info.category){
            html += genRow2('유형', sbjInfo.info.category)
        }
        
        if (sbjInfo.info.difficulty){
            html += genRow2('지정 난이도', sbjInfo.info.difficulty);
        }

        html += '</table>';
    }

    //  차시목표 & 서비스 정보
    if (sbjInfo.goal){
        html += (html?'<br/>':'')+'<table><tr><th>차시 목표</th></tr><tr><td>';

        var existServiceInfo = false;
        var htmlGoal = '';

        for(var i in sbjInfo.goal){
            htmlGoal += (htmlGoal?', ':'') + escapeHTML(sbjInfo.goal[i].title+'('+i+')');
            if (sbjInfo.goal[i].service) existServiceInfo = true;
        }
        html += htmlGoal + '</td></tr></table>';

        //  서비스 정보
        if (existServiceInfo && tsQsbjTool._cfg.service && tsQsbjTool._cfg.service.subjectDictate){
            html += (html?'<br/>':'')+'<table><tr><th>서비스 정보</th></tr><tr><td>';

            var htmlSvc = '';

            for(var i in sbjInfo.goal){
            htmlSvc += (htmlSvc?', ':'') + tsQsbjTool._cfg.service.subjectDictate(tsQsbjTool.subject[sbjId], sbjInfo.goal);
            }
            html += htmlSvc + '</td></tr></table>';
        }
    }

    //  문항 정보
    if (sbjInfo.q){
        var qInfoTitle = {self:'문항', lineal:'문항-직계', descendant:'문항-방계'}
        
        for(var k in sbjInfo.q){
            if (sbjInfo.q[k]){
                html += (html?'<br/>':'')+genHader2(qInfoTitle[k]);
                html += '<table>';

                var qInfo = tsQsbjTool.subjectDictateQinfo(sbjInfo.q[k]);

                for(var i = 0; i < qInfo.length; i ++){
                    if (qInfo[i].count){
                    var qList = '';

                    for(var j = 0; j < qInfo[i].count; j ++){
                        if (tsQset.qProxyResolve(qInfo[i].list[j])){ // PROXY문항은 실행할 필요가 없음
                            qList += (qList?' ':'') + escapeHTML(tsQset.qProxyResolve(qInfo[i].list[j]));
                        }
                        else{
                            qList += (qList?' ':'') + '<div class="subNode" style="display:inline-block;margin-bottom:1px;" onclick="qsetUiRun(\''+qInfo[i].list[j]+'\');">' + escapeHTML(qInfo[i].list[j]) + '</div>';
                        }
                    }
                    html += genRow2(qInfo[i].tip+'('+qInfo[i].count+')', qList, true);
                    }
                }
                html += '</table>';
            }
        }
    }

    return html;
}

////////////////////////////////////////////////////////////////////////////////////
//  Subject2Q

/*  주제와 문항의 MAP을 구성함. %%INFO 이후 함수에 's2q'로 prefix처리함
    문항은 코스를 톻하여 그 목록을 파악함
*/
tsQsbjTool.s2qBuild = function(onSucc, onErr)
{
    //  this.tree가 존재하면, 이 함수 실행에 필요한 주제가 모두 로딩된 것임. 주제는 this.subject에 있음.
    if (!this.tree){
        if (onErr) onErr(2, 'Try again after loading all subject information.');
        return;
    }

    var _this = this;

    //  데이터
    var q = {}; // Q의 목록. 1=고정식, 2=은행식, 3=종속식
    var qset = [];

    //  검증용 변수
    var sttQmapped = {}, sttQmappedCnt = 0; // 주제에 맵핑된 Q

    //  (2) QSET LOAD관련 Callback 함수
    var qsetMap1, qsetMap2 = {}, qsetMap3 = {}; // 고정식, 은행식, 종속식 파악을 위한 것임
    var qsetLoadCnt = 0;
    
    function onLoadQset(key, /*{}|undefined*/qsetData)
    {
        qsetLoadCnt ++;

        if (!qsetData){
            tsPando.log.call(_this, 2, 'Qset - Load failed. ID='+key);
        }
        else{
            var _q = tsPando.qsetGetQ(qsetData);
            
            for(var i in _q){
                //  종속식은 고정식의 '일부'이므로, 종속식에 속하는 것을 우선 파악해야 함
                q[i] = qsetMap3[key] ? 3 : (qsetMap2[key] ? 2 : 1);
            }
        }
    
        //  Q 데이터 로드
        if (qsetLoadCnt == qset.length){
            //  PROXY 문항 추가
            var proxyQ;

            for(var i in _this.subject){
                if (proxyQ = tsQset.qProxyFromSubject(i)){
                    q[proxyQ] = tsQset.qProxyType(proxyQ); // 제작 문항 파악을 위하여, PROXY문항은 별도 지정함 
                }
            }

            _this._cfg.storage.q.call(_this, q, onLoadQ, onLoadQ);
        }
    }

    //  (3) Q LOAD관련 Callback 함수
    function onLoadQ(/*{}|undefined*/qs)
    {
        //  Subject-to-Q MAP
        var subjectToQ = {};
        var subject, subjectID;

        for(var i in qs){
            subject = undefined;

            if (qs[i].meta && qs[i].meta.subject){
                subject = qs[i].meta.subject;
            }
            else if (qs[i].caliper){ // Caliper가 별도로 있는 경우
                for(var j = 0; j < qs[i].caliper.length; j ++){
                    if (qs[i].caliper[j].meta && qs[i].caliper[j].meta.subject){
                        subject = subject || [];
                        subject = subject.concat(qs[i].caliper[j].meta.subject);
                    }
                }
            }

            if (subject){
                for(var j = 0; j < subject.length; j ++ ){
                    subjectID = subject[j];

                    //  dict:apple -> dict:apple/0로 보정
                    if (subjectID.indexOf('dict:') == 0 && subjectID.indexOf('dict::') == -1){
                        if (subjectID.indexOf('/') == -1) subjectID += '/0';
                    }

                    if (!_this.subject[subjectID]){
                        subjectID = '%%ERROR:'+subjectID; // 오류 저장을 위한 것임. s2qVerify()가 삭제함
                    }
                    
                    subjectToQ[subjectID] = subjectToQ[subjectID] || {};
                    subjectToQ[subjectID][q[i]] = subjectToQ[subjectID][q[i]] || [];
                    subjectToQ[subjectID][q[i]].push(i);
                    
                    sttQmapped[i] = true;
                }
            }
        }

        //%%검증
        var sttQdangledCnt = 0, sttQdangled = '';

        for(var i in sttQmapped) sttQmappedCnt ++;

        for(i in q){
            if (!sttQmapped[i]){
                sttQdangledCnt ++;
                sttQdangled += (sttQdangled?', ':'') + i;
            }
        }
        if (sttQdangled) tsPando.log.call(_this, 1, 'SubjectToQ - '+sttQdangledCnt+' Qs are dangled from Subject. ID='+sttQdangled);

        //  완료
        _this.mapSubjectToQ = subjectToQ;
        _this.s2qVerify();

        onSucc(subjectToQ);
    }

    //  (1) 코스 로딩 - 문항SET 파악
    this._cfg.storage.course.call(_this
        ,function (/*{}*/course){
            //  코스 로딩됨
            tsPando.log.call(_this, 0, 'Course loaded.');

            _this.course = course;

            //  각 종류의 QSET 목록 파악
            qsetMap1 = tsPando.courseGetQset(course);
            qsetMap2 = tsPando.courseGetQset(course, 2); // 은행식
            qsetMap3 = tsPando.courseGetQset(course, 3); // 종속식

            for(var i in qsetMap1){
                qset.push(i);
            }
            for(i in qsetMap2){
                qset.push(i);
            }
            for(i in qsetMap3){
                qset.push(i);
            }

            //  QSET 정보를 모두 Storage에서 가져옴. Q의 목록을 파악하기 위함
            if (qset.length){
                for(var i = 0; i < qset.length; i ++){
                    _this._cfg.storage.qsetData.call(_this, qset[i], onLoadQset, onLoadQset);
                }
            }
            else{
                if (onErr) onErr(2, 'Course - Empty.');
                return;
            }
        }
        ,function(err){
            if (onErr) onErr(2, 'Course - Storage error.');
        }
    );
}

//  SubjectToQ //%%검증
tsQsbjTool.s2qVerify = function()
{
    if (!(this.subject && this.mapSubjectToQ)) return;

    for(var i in this.mapSubjectToQ){
        //  (0) 주제 오류 검증 - '%%ERROR'을 검사
        if (i.indexOf('%%ERROR:') == 0){
            var subjectID = i.substring(8);

            for(var k in this.mapSubjectToQ[i]){
                for(var j = 0; j < this.mapSubjectToQ[i][k].length; j ++){
                    tsPando.log.call(this, 2, 'SubjectToQ - Unknown Subject='+subjectID+' in Q='+this.mapSubjectToQ[i][k][j]); //%%검증
                }
            }
        }
        else{
            //  (1) 주제 파일과 버전이 맞지 않는 상황. 즉 없는 주제가 발생하는 경우
            if (!this.subject[i]){
                tsPando.log.call(this, 2, 'SubjectToQ - Unknown Subject='+i+'. Please, check the verson of SubjectToQ map.'); //%%검증
            }
            else{
                //  (2) 말단 노드가 아닌 곳에 문항이 걸리며 경고
                if (this.subject[i].child && this.subject[i].child.length){
                    for(var k in this.mapSubjectToQ[i]){
                        for(var j = 0; j < this.mapSubjectToQ[i][k].length; j ++){
                            tsPando.log.call(this, 1, 'SubjectToQ - Q='+this.mapSubjectToQ[i][k][j]+' is linked under non-termial Subject='+i+','+this.subject[i].title); //%%검증
                        }
                    }
                }
            }
        }
    }
}


////////////////////////////////////////////////////////////////////////////////////
//  Q2QUI

tsQsbjTool.q2uiBuild = function(onSucc, onErr)
{
    var _this = this;
    var buildCnt = 0;
    var gDataQ, gDataQui;

    function build()
    {
        buildCnt ++;

        if (buildCnt == 2){
            // Theme은 gDataQui{}에서 직접 파악함
            var themeList = {}; 

            for(var i in gDataQui){
                if (gDataQui[i].service && gDataQui[i].service.storage){
                    for(var theme in gDataQui[i].service.storage){
                        themeList[theme] = true;
                    }
                }
            }

            /*  {
                    qId:{
                        theme:[qUiId,...]
                        ...
                    }
                    ...
                }
            */
            var ret = {};
            var list;

            for(var i in gDataQ){
                ret[i] = {};

                for(var j in themeList){
                    list = tsPando.qMatchUI(i, gDataQ[i], gDataQui, /*theme*/j);
                    if (list.length) ret[i][j] = list;
                }
            }

            onSucc(ret);
        }
    }

    //  Q의 목록을 this.mapSubjectToQ{}에서 추출함
    if (!this.mapSubjectToQ){
        if (onErr) onErr(2, 'Try again after loading Subject2Q information.');
        return;
    }

    //  Q의 목록
    var q = [], qMap = {}; // Q의 목록. 1=고정식, 2=은행식, 3=종속식
    
    for(var i in this.mapSubjectToQ){
        for(var j in this.mapSubjectToQ[i]){
            for(var k = 0; k < this.mapSubjectToQ[i][j].length; k ++){
                qMap[this.mapSubjectToQ[i][j][k]] = true;
            }
        }
    }

    this._cfg.storage.q.call(this, qMap
        ,function onLoadQ(/*{}|undefined*/qData){
            gDataQ = qData;
            build();
        }
        ,function(err){
            if (onErr) onErr(2, 'Q - Storage error.');
        }
    );

    //  QUI Data
    this._cfg.storage.quiData.call(this
        ,function (/*{}*/quiData){
            gDataQui = quiData;
            build();
        }
        ,function(err){
            if (onErr) onErr(2, 'QuiData - Storage error.');
        }
    );
}


////////////////////////////////////////////////////////////////////////////////////
//  Dict

tsQsbjTool.dictVerify = function()
{
    //  dictGroup에 없는 dict가 Link된 경우를 파악함
    var dictGroupCheck = {};

    if (this.dictGroup){
        for(var i in this.dictGroup){
            if (this.dictGroup[i].Word){
                for(var j in this.dictGroup[i].Word){
                    if (!tsPando.dictLookup(this.dict, j)){
                        dictGroupCheck[j] = true;
                    }
                }
            }
            else{
                tsPando.log.call(this, 2, 'Audit Dict - DictGroup does not have any \'Word\'. ID='+i);
            }
        }

        for(var i in dictGroupCheck){
            tsPando.log.call(this, 2, 'Audit Dict - Word=\''+i+'\' is at DictGroup, BUT not listed at Dict.');
        }
    }

    //  A. 문장에 포함된 단어 파악
    var dictCheck = {};
    var word;

    if (this.mapSentenceToDict){
        for(var i in this.mapSentenceToDict){
            if (this.mapSentenceToDict[i].word){
                for(var j = 0; j < this.mapSentenceToDict[i].word.length; j ++){
                    word = this.mapSentenceToDict[i].word[j].Dict;
                    
                    if (!tsPando.dictIsValidWord(word, /*Trace*/this, 'Audit Dict at SentenceIndex')) continue;
                    
                    //  Valid
                    if (word.indexOf('/') == -1) word += '/0';
                    dictCheck[word] = 'S'; // 정확히 LOG를 남기기 위해서 구분함
                }
            }
        }
    }

    //  B. 구문에 포함된 단어 파악
    if (this.phraseWord){
        for(var word in this.phraseWord){
            if (!tsPando.dictIsValidWord(word, /*Trace*/this, 'Audit Dict at Phrase')) continue;

            dictCheck[word] = dictCheck[word] ? dictCheck[word]+'P' : 'P'; // 정확히 LOG를 남기기 위해서 구분함
        }
    }

    //  사전에 포함된 단어 파악
    var dict = {};

    for(i in this.dict){
        if (this.dict[i] instanceof Array){
            for(var j = 0; j < this.dict[i].length; j ++){
                dict[i+'/'+j] = true;
            }
        }
        else{
            dict[i+'/0'] = true;
        }
    }

    //  문장에 있으나, 단어 사전에 없는 경우를 검증
    for(i in dictCheck){
        if (!dict[i]){
            var place;

            if (dictCheck[i] == 'S') place = 'SentenceIndex';
            else if (dictCheck[i] == 'P') place = 'Phrase';
            else place = 'SentenceIndex and Phrase';

            tsPando.log.call(this, 2, 'Audit Dict - Word=\''+i+'\' is at ' + place + ', BUT not listed at Dict.');
        }
    }

    //  단어 사전에 있으나 문장에 없는 경우
    for(i in dict){
        if (/*NE가 아니고*/i[0] != '$' && !dictCheck[i]){
            tsPando.log.call(this, 2, 'Audit Dict - Unindexed word is listed at Dict. Word='+i);
        }
    }
}


////////////////////////////////////////////////////////////////////////////////////
//  Subject

tsQsbjTool.s2qStVerify = function()
{
    var buf;

    for(var id in this.subject){
        // %%검증 - 문항이 없는 주제에 대해서 Warning 표시함
        if (this.get('ui', 'verifyLevel') == 2){
            if (!(buf=this.mapSubjectToQ_collected[id])){
                tsPando.log.call(this, 1, 'SubjectToQ - Empty Subject is found. Subject='+id+', Title='+(this.subject[id].titleShort||this.subject[id].title));
            }
            else{
                // %%검증 - GOAL로 지정된 주제라면, 충분한 문항을 가지고 있는지 조사함
                if (tsQsbjTool.get('service', 'minQ4GoalSubject')){
                    if (/*PROXY가 아니고*/!tsQset.qProxyFromSubject(id) && tsQsbjTool.subjectGetInfo(id).goal){
                        var cnt = 0;

                        for(var i in buf){
                            for(var j in buf[i]){
                                cnt += buf[i][j].length;
                            }
                        }
                        
                        if (cnt < tsQsbjTool.get('service', 'minQ4GoalSubject')){
                            tsPando.log.call(this, 1, 'SubjectToQ - Goal Subject does not have enough Q for service. Subject='+id+', Title='+(this.subject[id].titleShort||this.subject[id].title));
                        }
                    }
                }
            }
        }
    }
}


////////////////////////////////////////////////////////////////////////////////////
//  QSET

//  Q와 QUI Data를 먼저 읽어야 하므로, Async 방식으로 구현함
tsQsbjTool.qsetBuild = function(/*ID*/q, /*Enum|undefined*/targetTheme, onRet)/*Qset{}|undefined*/
{
    var _this = this;
    var workCnt = 2, workDone = 0;

    //  QUI Data
    if (!this.quiData){
        this._cfg.storage.quiData.call(this
            ,function (/*{}*/quiData){
                _this.quiData = quiData;
                build();
            }
            ,function(err){
                tsPando.log.call(this, 2, 'QuiData - Storage error.');
            }
        );
    }
    else{
        workDone ++;
    }

    var qData, reqQ = {};

    reqQ[q] = true;

    this._cfg.storage.q.call(this, reqQ
        ,function onLoadQ(/*{}|undefined*/Qs){
            qData = Qs[q];
            build();
        }
        ,function(err){
            tsPando.log.call(this, 2, 'Q - Storage error.');
        }
    );

    function build()
    {
        workDone ++;

        if (workCnt == workDone){
            onRet(/*ID*/q, /*{}*/qData, tsPando.qsetBuildByQ(_this.quiData, /*ID*/q, /*{}*/qData, targetTheme));
        }
    }
}

////////////////////////////////////////////////////////////////////////////////////
//  Tree

/*  다음과 같은 Tree구조로 변경함. LOOP Check은 이미 실행된 Graph로 가정함.

    {
        "Title":"ECC iLearning"
        ,"childNode":[
            {}, ...
        ]
    }

    chlid[id,...] => childNode[{},...]
    relative[id,...] => 그대로 남김
*/
tsQsbjTool._toTree = function(subject)
{
    var bootStrap = this.get('ui', 'bootStrapSubject') || {Title:'[Subject]', childNode:[]};
    var data = bx.$cloneObject({}, subject);
    var node, id;

    //  Child 상태인 것을 표시함
    for(var i in data){
        node = data[i];

        if (node.child && node.child.length){
            for(var j = 0; j < node.child.length; j ++){
                id = node.child[j];
                if (data[id]){
                    data[id]._child = true;
                }
            }
        }
    }

    //  데이터 구조를 TREE 표시에 적합한 형태로 변경함
    for(var i in data){
        node = data[i];

        node.Title = (node.titleShort||node.title) || '[Untitled]';
        node.id = i;
        if (node.title) delete node.title;

        if (!(node.child && node.child.length)) continue;
        
        node.childNode = [];

        for(var j = 0; j < node.child.length; j ++){
            id = node.child[j];

            if (data[id]){
                node.childNode.push(data[id]);
            }
        }
        delete node.child;
    }

    //  bootStrap 밑으로 추가함. %%INFO 1단계 Child까지 rule{}에 의한 추가
    var added;

    for(var i in data){
        if (data[i]._child) continue;

        added = false;

        //  규칙에 의한 SubRoot에 추가
        for(var j = 0; j < bootStrap.childNode.length; j ++){
            if ((node = bootStrap.childNode[j]) && node.rule){
                for(var k in node.rule){
                    /*  RULE
                        (1) ID로 직접 추가하는 방식
                        (2) 속성이 일치하면 추가하는 방식
                    */
                    if (/*(1)*/k == 'id' && node.rule[k] == i){
                        node.childNode = data[i].childNode;
                        added = true;
                    }
                    else if (/*(2)*/subject[i][k] == node.rule[k]){
                        node.childNode = node.childNode || [];
                        node.childNode.push(data[i]);
                        added = true;
                    }
                }
            }
        }

        //  아니면 Root에 추가
        if (!added) bootStrap.childNode.push(data[i]);
    }

    return bootStrap;
}

//  각 Terminal Node에 있는 Qinfo를 수집함
tsQsbjTool.treeCollectQinfo = function()
{
    if (!this.tree) return;

    var mapSubjectToQ = this.mapSubjectToQ;

    function traverseCheck(node, depth)
    {
      if (mapSubjectToQ && mapSubjectToQ[node.id]){
         node.infoQ = mapSubjectToQ[node.id];
      }
  
      if (node.childNode && node.childNode.length){
        for(var i = 0; i < node.childNode.length; i ++){
          traverseCheck(node.childNode[i], depth + 1);
  
          //  하위 Node에 포함된 문항 정보를 취합
          if (node.childNode[i].infoQ){
            var buf;
            
            for(var k in node.childNode[i].infoQ){
              if ((buf = node.childNode[i].infoQ[k]) && buf.length){
                node.infoQ = node.infoQ || {};
                node.infoQ[k] = node.infoQ[k] || [];
  
                for(var j = 0; j < buf.length; j ++){
                  if (node.infoQ[k].indexOf(buf[j]) == -1){
                    node.infoQ[k].push(buf[j]);
                  }
                }
              }
            }
          }
        }
      }
    }
  
    traverseCheck(this.tree, 0); // Data 수집
}
