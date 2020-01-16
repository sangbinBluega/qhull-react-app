////////////////////////////////////////////////////////////////////////////////
//  tsQhull

window.tsQhull = window.tsQhull || {_cfg:{}}

/*  storage
        course
    resolver
        course
        qsetUi
    listener
        sensor
    ui
        qsetRatio: Float, Qset 실행창 Ratio. 가로 기준 세로 비율. 없으면 저작기의 기본값으로 그냥 표시
        title: String, TOOL 명칭
*/
tsQhull.set = function(/*String*/group, /*String*/key, value)
{
    this._cfg[group] = this._cfg[group] || {};
    this._cfg[group][key] = value;
}

tsQhull.get = function(/*String*/group, /*String*/key)/*Value|undefined*/
{
    if (this._cfg[group]) return this._cfg[group][key];
}

tsQhull.init = function(onSucc, onErr)
{
    var _this = this;

    this._cfg.storage.course.call(this, function (/*{}*/course){
            _this.course = course;

            //  차시모들의 Content 정보에 차시 ID를 넣어 줍니다. 이것은 QSET 호출 정보를 위한 것입니다.
            function traverse(node, depth)
            {
                if (node.childNode && node.childNode.length){
                    for(var i = 0; i < node.childNode.length; i ++){
                        if (depth == 2){ // 차시이면
                            if (node.childNode[i].Content) node.childNode[i].Content.idLesson = node.Id;
                        }
                        traverse(node.childNode[i], depth + 1);
                    }
                }
            }
            traverse(course, 0);

            if (onSucc) onSucc();
        }
        ,function(err){
            if (onErr) onErr(Err);
        }
    );

    //  Listener-sensor
    window.addEventListener('message', function(ev){
        function escapeHTML(text)
        {
          return (text+'').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\'/g, '&apos;').replace(/\"/g, '&quot;').replace(/>/g, '&gt;');
        }

        if (ev.data && ev.data.pando && ev.data.pando.event == 'sensor'){
            if (_this._cfg.listener && _this._cfg.listener.sensor){
                var sensor = ev.data.pando.data.sensor;
                var msg = '<div style="color:yellow;">[Sensor] ' + sensor.Sensor + '</div>';

                msg += '<div style="padding-left:1em;"><span style="color:yellow;">[Data]</span><br/>' + escapeHTML(JSON.stringify(sensor.Data)) + '</div>';
                if (sensor.where) msg += '<div style="padding-left:1em;"><span style="color:yellow;">[Where]<br/></span>' + escapeHTML(JSON.stringify(sensor.where)) + '</div>';

                _this._cfg.listener.sensor.call(_this, msg);

                //  Sentence
                var sentence = {}, sentenceMap = {}, sentenceArray = [];
                var meta;

                for(var i = 0; i < sensor.Data.length; i ++){
                    for(var j = 0; j < sensor.Data[i].Q.length; j ++){
                        if ((meta = sensor.Data[i].Q[j].meta) && meta.sentence){
                            for(var k = 0; k < meta.sentence.length; k ++){
                                sentence[meta.sentence[k]] = true;
                                sentenceMap[sensor.Data[i].Q[j].IdQ] = sentenceMap[sensor.Data[i].Q[j].IdQ] || {};
                                sentenceMap[sensor.Data[i].Q[j].IdQ][meta.sentence[k]] = true;
                            }
                        }
                    }
                }

                for(i in sentence){
                    sentenceArray.push(i);
                }

                if (sentenceArray.length && _this._cfg.storage.sentence){
                    _this._cfg.storage.sentence.call(_this, sentenceArray, function(data){
                        var msg = '';

                        for(var i in sentenceMap){
                            msg += '<div style="padding-left:1em;"><span style="color:yellow;">[Sentence] '+i+'</span><br/>';
                            for(var j in sentenceMap[i]){
                                msg += (data[j] && data[j].Text ? escapeHTML(data[j].Text) : 'UNKNOWN!') + '<br/>';
                            }
                            msg += '</div>';
                        }

                        _this._cfg.listener.sensor.call(_this, msg);
                    });
                }

                //  Subject
                var subject = {}, subjectMap = {}, subjectArray = [];

                for(var i = 0; i < sensor.Data.length; i ++){
                    for(var j = 0; j < sensor.Data[i].Q.length; j ++){
                        if ((meta = sensor.Data[i].Q[j].meta) && meta.subject){
                            for(var k = 0; k < meta.subject.length; k ++){
                                subject[meta.subject[k]] = true;
                                subjectMap[sensor.Data[i].Q[j].IdQ] = subjectMap[sensor.Data[i].Q[j].IdQ] || {};
                                subjectMap[sensor.Data[i].Q[j].IdQ][meta.subject[k]] = true;
                            }
                        }
                    }
                }

                for(i in subject){
                    subjectArray.push(i);
                }

                if (subjectArray.length && _this._cfg.storage.subject){
                    _this._cfg.storage.subject.call(_this, subjectArray, function(data){
                        var msg = '';

                        for(var i in subjectMap){
                            msg += '<div style="padding-left:1em;"><span style="color:yellow;">[Subject] '+i+'</span><br/>';
                            for(var j in subjectMap[i]){
                                msg += (data[j] ? escapeHTML(data[j].title) : 'UNKNOWN!') + ' ';
                            }
                            msg += '</div>';
                        }

                        _this._cfg.listener.sensor.call(_this, msg);
                    });
                }
            }
        }
    }, false);
}
