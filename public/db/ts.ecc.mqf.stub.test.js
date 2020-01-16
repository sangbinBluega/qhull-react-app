function eccUtilJsonLoad(key, url, onSucc, onErr)
{
    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function()
    {
        if (this.readyState == 4 && this.status == 200) {
            var data = xhttp.responseText;
            var file;

            if (data){
                try{
                    var file = JSON.parse(data); // window.apnExeFile= 제외
                }
                catch(ex){
                    console.error('XMLHttpRequest', ex);
                }
            }

            if (file){
                onSucc(key, file);
            }
            else{
                if (onErr) onErr(key);
            }
        }
    }

    xhttp.open("GET", url, true);
    xhttp.send();
}

//  다수의 Q를 JSON으로 로딩함
function eccUtilQLoad(_this, qIds, onSucc, onErr)
{
    function onLoad(key, file)
    {
        done ++;

        qs[key] = file;

        if (done + fail == count){
            if (fail) onErr();
            else onSucc(qs);
        }
    }

    function onFail(key)
    {
        fail ++;
       
        if (done + fail == count){
            onErr();
        }
    }

    var count = 0, done = 0, fail = 0;
    var qs = {};

    for(var i in qIds){
        count ++;
    }

    for(i in qIds){
        eccUtilJsonLoad(i, _this._cfg.resolver.q.call(_this, i), onLoad, onFail);
    }
}

function eccQsetLoad(qsetId, onSucc, onErr)
{
    var _this = this;
    var qset, quiInfo;

    function loadQ(data)
    {
        var buf;

        for(var i = 0; i < qset.Content.length; i ++){
            for(var j = 0; j < qset.Content[i].List.length; j ++){
                buf = qset.Content[i].List[j];
                
                for(var k = 0; k < buf.Content.length; k ++){
                    if (data[buf.Content[k].QId]){
                        buf.Content[k].QData = data[buf.Content[k].QId];
                    }
                    else{
                        console.error('Missing Q', buf.Content[k].QId);
                    }
                }
            }
        }

        onSucc(qset);
    }
    
    function tstOnLoad(key, file)
    {
        qset = file;

        if (qset && qset.Content && qset.Content.length){
            var buf, buf2;

            //  포함된 QUI 정보를 QuiInfo의 정보로 교체
            for(var i = 0; i < qset.Content.length; i ++){
                buf = qset.Content[i].Qui;

                if (typeof buf == 'string'){
                    if (quiInfo[buf]){
                        qset.Content[i].Qui = quiInfo[buf].service.storage;
                    }
                }

                for(var j = 0; j < qset.Content[i].List.length; j ++){
                    for(var k = 0; k < qset.Content[i].List[j].Content.length; k ++){
                        buf2 = qset.Content[i].List[j].Content[k].qui;

                        if (buf2 && typeof buf2 == 'string'){
                            if (quiInfo[buf2]){
                                qset.Content[i].List[j].Content[k].qui = quiInfo[buf2].service.storage;
                            }
                        }
                    }
                }
            }

            //  포함된 Q의 ID 확인
            var qIds = {};

            for(var i = 0; i < qset.Content.length; i ++){
                for(var j = 0; j < qset.Content[i].List.length; j ++){
                    for(var k = 0; k < qset.Content[i].List[j].Content.length; k ++){
                        qIds[qset.Content[i].List[j].Content[k].QId] = true;
                    }
                }
            }

            eccUtilQLoad(_this, qIds, loadQ, onErr)
        }
        else{
            onErr(tsQset.errQsetData);
        }
    }

    //  QUI INFO가 필요하므로 먼저 로딩함
    function tstOnLoadQuiInfo(data)
    {
        quiInfo = data;

        eccUtilJsonLoad(qsetId, _this._cfg.resolver.qset.call(_this, qsetId), tstOnLoad, onErr);
    }

    eccQuiInfoLoad.call(_this, tstOnLoadQuiInfo, onErr);
}

function eccQuiLoad(quiId, onSucc, onErr)
{
    var _this = this;
    
    function tstOnLoad2()
    {
        var data

        if (_this._orgApnExe != window.apnExeFile){
            data = apnExeFile;
            apn.Project.docDcmpr(data);
            
            window.apnExeFile = _this._orgApnExe; // 마스터(현재 실행 파일)로 지정해야 함
        }
        
        if (data){
            onSucc(quiId, data);
        }
        else{
            onErr(tsQset.errQui);
        }
    }

    try{
        bx.HCL.importModule(_this._cfg.resolver.qui.call(_this, quiId)+'/data.js', 2/*Tag*/, /*No-cache*/true, tstOnLoad2, onErr); // 개발중이므로 No-cache true
    }
    catch(ex)
    {
        onErr(tsQset.errQuiLoad);
    }
}

function eccQuiInfoLoad(onSucc, onErr)
{
    var _this = this;
    
    function tstOnLoad2()
    {
        var data = eccQuiDataBuf; // Data가 임시 Global 변수로
        
        eccQuiDataBuf = undefined;

        if (data){
            onSucc(data);
        }
        else{
            onErr(0); // Data
        }
    }

    try{
        bx.HCL.importModule(_this._cfg.resolver.quiData.call(_this), 2/*Tag*/, /*No-cache*/true, tstOnLoad2, onErr); // 개발중이므로 No-cache true
    }
    catch(ex)
    {
        onErr(ex); // Connection
    }
}

function eccCourseLoad(onSucc, onErr)
{
    var _this = this;
    
    function tstOnLoad2()
    {
        var data = eccCourseBuf; // Data가 임시 Global 변수로
        
        eccCourseBuf = undefined;

        if (data){
            onSucc(data);
        }
        else{
            onErr(0); // Data
        }
    }

    try{
        bx.HCL.importModule(_this._cfg.resolver.course.call(_this), 2/*Tag*/, /*No-cache*/true, tstOnLoad2, onErr); // 개발중이므로 No-cache true
    }
    catch(ex)
    {
        onErr(ex); // Connection
    }
}

function eccQResolve(qId)
{
    return location.origin+'/tool/ecc/q/'+qId+'.json'
}

function eccQsetResolve(qsetId)
{
    return location.origin+'/tool/ecc/qset/'+qsetId+'.json';
}

function eccQuiResolve(quiId)
{
    return 'http://blg.aspenux.com/tool/ecc/qui/'+quiId;
}

function eccQuiInfoResolve()
{
    return 'http://blg.aspenux.com/tool/ecc/qui/data.js';
}

function eccCourseResolve()
{
    return 'http://blg.aspenux.com/tool/ecc/course/course.js';
}

function eccQsetUiResolve(idQsetUi)
{
    return 'http://blg.aspenux.com/tool/ecc/qsetUi/'+idQsetUi+'/index.html';
}

