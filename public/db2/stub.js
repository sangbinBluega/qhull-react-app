//tsQsbjExe.set('storage', 'sentence', eccSentenceLoad); // TRACE
//tsQsbjExe.set('resolver', 'sentence', eccSentenceResolve); // TRACE
tsQsbjExe.set("storage", "subject", eccSubjectLoad);
tsQsbjExe.set("resolver", "subject", eccSubjectResolve);
tsQsbjExe.set("storage", "dict", eccDictLoad);
tsQsbjExe.set("resolver", "dict", eccDictResolve);
tsQsbjExe.set("storage", "dictGroup", eccDictGroupLoad);
tsQsbjExe.set("resolver", "dictGroup", eccDictGroupResolve);
tsQsbjExe.set("resolver", "qsetUi", eccQsetUiResolve); // QSET실행목적

tsQsbjExe.set("storage", "quiData", eccQuiInfoLoad);
tsQsbjExe.set("resolver", "quiData", eccQuiInfoResolve);
tsQsbjExe.set("storage", "qsetData", eccQsetDataLoad);
tsQsbjExe.set("resolver", "qset", eccQsetResolve);

tsQsbjExe.set("api", "stSubjectToQ", function(uIds, onSucc, onErr) {
  eccAlSubjectAPI.call(tsQsbjExe, "stSubjectToQ", onSucc, onErr, uIds);
});
tsQsbjExe.set("api", "stQToQui", function(uIds, onSucc, onErr) {
  eccAlSubjectAPI.call(tsQsbjExe, "stQToQui", onSucc, onErr, uIds);
});

tsQsbjExe.set("ui", "title", "주제 실행기");
tsQsbjExe.set("ui", "titleLogo", "db/titleLogo.png");
tsQsbjExe.set("ui", "fullLogo", "db/fullLogo.png");
tsQsbjExe.set("ui", "contentRatio", "0.5625"); // 720/1280
tsQsbjExe.set("ui", "disabled", true);

//  TREE 상단 구성 정보
tsQsbjExe.set("ui", "bootStrapSubject", {
  Title: "[ECC iLearning]",
  childNode: [
    { Title: "[Grammer]", rule: { category: "Grammar" } },
    { Title: "[Pattern]", rule: { category: "Pattern" } },
    { Title: "[Subject]", rule: { category: "Subject" } },
    //,{Title:'[Conversation]', rule:{category:'Conversation'}}
    { Title: "[Phrase]", rule: { id: "phrase::" } }, // ID로 찾아서 Mapping
    { Title: "[Word]", rule: { id: "dict::" } },
    { Title: "[Phonics]", rule: { category: "Phonics" } }
  ]
});

/*  지원하는 QSET UI 정보. accept, theme, Format 정보는 문항SET UI 정봐와 동일하게 있어야 함. 문항 목록을 사전 Check하기 위한 목적
    UI 표시상 'embed'가 앞쪽에 위치하는 것이 좋음
*/
tsQsbjExe.set("ui", "qsetUi", [
  // 등록된 QSET 목록
  {
    id: "Submarine",
    _title: "Word Submarine",
    _abbr: "SM",
    _clr: "#ff0000",
    Format: "Q",
    theme: "embed",
    qui: "$WORD_SUBMARINE"
  },
  {
    id: "WordPuzzle",
    _title: "Word Puzzle",
    _abbr: "WP",
    _clr: "#ff0000",
    Format: "Q",
    theme: "embed",
    qui: "$WORD_PUZZLE"
  },
  {
    id: "Game2",
    _title: "Tilemap Game Sample",
    _abbr: "G2",
    _clr: "#0000ff",
    Format: "Q",
    theme: "basic"
  },
  {
    id: "Paper",
    _title: "Paper",
    _abbr: "PP",
    _clr: "#0000ff",
    Format: "Q",
    theme: "paper"
  },
  {
    id: "CheckUp",
    _title: "Check Up",
    _abbr: "CK",
    _clr: "#0000ff",
    Format: "P",
    theme: "basic"
  },
  {
    id: "$QEDITOR",
    _title: "Tester",
    _abbr: "QT",
    _clr: "#000000",
    Format: "P",
    theme: "basic"
  }
]);

/*  UI 확인 사항 %%TODO
contentRatio
titleLogo
fullLogo
*/
