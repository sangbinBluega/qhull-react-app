////////////////////////////////////////////////////////////////////////////////
//  tsQsbjExe

window.tsQsbjExe = tsQsbjTool;

/*  tsQsbjTool{}에서 추가되는 항목

    ui
        qsetRatio: Float, Qset 실행창 Ratio. 가로 기준 세로 비율. 없으면 저작기의 기본값으로 그냥 표시
        qsetUi
*/

tsQsbjTool._init = tsQsbjTool.init;

tsQsbjExe.init = function(onSucc, onErr) {
  var _this = this;
  var loadCnt = 0;

  function onLoad() {
    if (loadCnt == 2) onSucc();
  }

  tsQsbjTool._init.call(
    this,
    function() {
      //  주제-TO-Q MAP 로딩 - 없는 경우도 있을 수 있음
      _this._cfg.api.stQToQui.call(
        _this,
        /*all*/ undefined,
        function(key, /*{}*/ data) {
          _this.mapQ2Ui = data;
          loadCnt++;
          onLoad();
        },
        function(err) {
          if (onErr) onErr();
        }
      );

      //  QUI DATA 로딩
      _this._cfg.storage.quiData.call(
        _this,
        function(/*{}*/ quiData) {
          _this.quiData = quiData;
          loadCnt++;
          onLoad();
        },
        function(err) {
          if (onErr) onErr(2, "QuiData - Storage error.");
        }
      );
    },
    onErr
  );
};

//  Subject[] 실행을 위한 실행 Content{} 생성
tsQsbjExe.subjectMakeContent = function(
  /*Array*/ sbjIds,
  /*{}*/ qsetui /*Content{}*/
) {
  //  실행 - 'Format', 'theme'은 문항SET UI가 채움. Qtarget, Qtarget는 undefined(무제한)로 지정
  var Content = {
    Type: "qsetGen",
    IdQsetUi: qsetui.id,
    IdSubject: sbjIds,
    Qtarget: {},
    QuiType: []
  };

  Content.Format = qsetui.Format;
  Content.theme = qsetui.theme;

  return Content;
};

tsQsbjExe.subjectGetTerminalNode = function(subjectID /*{sbjId,...}*/) {
  var _this = this;

  function traverseSubject(id, /*{}*/ map) {
    var node = _this.subject[id];

    if (!node) return;

    if (!(node.child && node.child.length)) {
      // 말단 Node이면 추가
      map[id] = true;
    } else {
      for (var i = 0; i < node.child.length; i++) {
        traverseSubject(node.child[i], map);
      }
    }
  }

  var subject = {}; // Terminal Node가 되는 Subject 목록

  if (subjectID) traverseSubject(subjectID, subject);

  return subject;
};

//  Subject[] 실행을 위한 QSETUI를 파악
tsQsbjExe.subjectGetQsetui = function(/*Array*/ sbjIds /*[QsetuiInfo{},...]*/) {
  if (!(this.mapQ2Ui && this.mapSubjectToQ && this.quiData)) return;

  var ret = [];

  //  주제들에 대한 Q 확인
  var qExist = false,
    q = {};
  var buf;

  for (var i = 0; i < sbjIds.length; i++) {
    if ((buf = this.mapSubjectToQ[sbjIds[i]])) {
      for (var j in buf) {
        for (var k = 0; k < buf[j].length; k++) {
          q[buf[j][k]] = true;
          qExist = true;
        }
      }
    }
  }

  if (!qExist) return ret;

  //  Q에 대한 QUI 확인. 내장형 QSETUI를 찾기 위함
  var qui = {};

  for (i in q) {
    if ((buf = this.mapQ2Ui[i])) {
      for (var j in buf) {
        for (var k = 0; k < buf[j].length; k++) {
          qui[buf[j][k]] = true;
        }
      }
    }
  }

  var embedQsetui = {}; // theme이 embed이면, 그 문항UI를 추가함
  var genericQsetui = false; // 일반 QSETUI 존재 여부

  for (i in qui) {
    if ((buf = this.quiData[i])) {
      if (buf.service && buf.service.storage) {
        for (var theme in buf.service.storage) {
          if (theme == "embed") {
            embedQsetui[i] = true;
          } else {
            genericQsetui = true;
          }
        }
      }
    }
  }

  var qsetui = this.get("ui", "qsetUi");

  for (i = 0; i < qsetui.length; i++) {
    if (qsetui[i].qui) {
      if (embedQsetui[qsetui[i].qui]) ret.push(qsetui[i]);
    } else {
      if (genericQsetui) ret.push(qsetui[i]);
    }
  }

  return ret;
};

//  각 Terminal Node에 있는 Qinfo를 수집함
tsQsbjExe.treeCollectQinfo = function() {
  if (!this.tree) return;

  var mapSubjectToQ = this.mapSubjectToQ;

  function traverseCheck(node, depth) {
    if (mapSubjectToQ && mapSubjectToQ[node.id]) {
      node.infoQ = mapSubjectToQ[node.id];
    }

    if (node.childNode && node.childNode.length) {
      for (var i = 0; i < node.childNode.length; i++) {
        traverseCheck(node.childNode[i], depth + 1);

        //  하위 Node에 포함된 문항 정보를 취합
        if (node.childNode[i].infoQ) {
          var buf;

          for (var k in node.childNode[i].infoQ) {
            if ((buf = node.childNode[i].infoQ[k]) && buf.length) {
              node.infoQ = node.infoQ || {};
              node.infoQ[k] = node.infoQ[k] || [];

              for (var j = 0; j < buf.length; j++) {
                if (node.infoQ[k].indexOf(buf[j]) == -1) {
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
};
