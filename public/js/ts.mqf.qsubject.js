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
    var _this = this;

    //  사전과 사전GROUP이 로딩되면 주제로 변환함
    var dictCnt = 0;

    function processDict()
    {
        dictCnt ++;

        if (dictCnt == 4){
            tsPando.log.call(_this, 0, 'Subject, Dict and DictGroup loaded.');

            //  단어와 단어GROUP을 주제에 병합
            tsPando.subjectFromDict(_this.subject, _this.dict, _this.dictGroup);
        
            //  Graph Loop Check
            var loop = tsPando.graphCheckLoop(_this.subject);
            
            if (loop.unknown){
                tsPando.log.call(_this, 2, 'Subject - Unknown. '+loop.unknown); //%%검증
            }

            if (loop.cycled){
                if (onErr) onErr(2, 'Subject - Graph cycled. '+loop.cycled);
                return;
            }

            //  Subject가 모두 로딩되면 같이 검증
            if (_this.mapSubjectToQ){
                _this.s2qVerify();
                tsPando.log.call(_this, 0, 'SubjectToQ loaded.');
            }

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
            if (onErr) onErr(2, 'Subject - Storage error.');
        }
    );

    //  사전 로딩 - 주제 변환을 위함
    _this._cfg.storage.dict.call(_this, /*all*/undefined
        ,function (key, /*{}*/dict){
            _this.dict = dict;
            processDict();
        }
        ,function(err){
            if (onErr) onErr(2, 'Dic - Storage error.');
        }
    );

    //  사전 GROUP 로딩 - 주제 변환을 위함
    _this._cfg.storage.dictGroup.call(_this, /*all*/undefined
        ,function (key, /*{}*/dictGroup){
            _this.dictGroup = dictGroup;
            processDict();
        }
        ,function(err){
            if (onErr) onErr(2, 'DictGroup - Storage error.');
        }
    );

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

    //  Listener-sensor
    window.addEventListener('message', function(ev){
        if (!(_this._cfg.listener && _this._cfg.listener.sensor)) return;
        if (!(ev.data && ev.data.pando)) return;

        tsPando.toConsole.call(_this, ev.data.pando, function(msg){
            _this._cfg.listener.sensor.call(_this, msg);
        });
    }, false);
}

/*  주제가 지원하는 문항의 정보. TOOL에서 표시할 수 있도록 정리해서 Return함
    [{tip:String,count:Number},...]
    편집 문항에 해당하는 1,2,3은 항상 생성함
*/
tsQsbjTool.subjectDictateQinfo = function(/*{1:[],...}*/infoQ)
{
    var tip = {1:'고정', 2:'은행', 3:'종속', 'word':'단어', 'compoundWord':'복합단어', 'phrase':'구문'};
    var ret = [];

    for(var i = 1; i <= 3; i ++){
        ret.push({tip:tip[i], count:infoQ&&infoQ[i]?infoQ[i].length:0})
    }

    if (infoQ){ // 'word' 등 나머지
        for(i in infoQ){
            if (!(i=='1'||i=='2'||i=='3')){
                ret.push({tip:tip[i], count:infoQ[i]?infoQ[i].length:0})
            }
        }
    }

    return ret;
}

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
    var qsetLoadCnt = 0;
    
    function onLoadQset(key, /*{}|undefined*/qsetData)
    {
        qsetLoadCnt ++;

        if (!qsetData){
            tsPando.log.call(_this, 2, 'Qset - Load loaded. ID='+key);
        }
        else{
            var _q = tsPando.qsetGetQ(qsetData);
            
            for(var i in _q){
                q[i] = 1; // 고정식
            }
        }
    
        //  Q 데이터 로드
        if (qsetLoadCnt == qset.length){
            //  PROXY문항추가
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
    function onLoadQ(/*{}|undefined*/qs){
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

    //  (1) 사전 GROUP 로딩 - 주제 변환을 위함
    this._cfg.storage.course.call(_this
        ,function (/*{}*/course){
            //  코스 로딩됨
            tsPando.log.call(_this, 0, 'Course loaded.');

            _this.course = course;

            //  고정식 QSET 목록 파악
            var qsetMap = tsPando.courseGetQset(course);

            for(var i in qsetMap){
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

//            processDict();
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
                tsPando.log.call(this, 2, 'SubjectToQ - Unknown Subject='+i); //%%검증
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

    //  (1) 사전 GROUP 로딩 - 주제 변환을 위함
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

        node.Title = node.title || '[Untitled]';
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
