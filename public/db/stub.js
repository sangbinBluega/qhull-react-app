tsQhull.set('storage', 'course', eccCourseLoad);
tsQhull.set('resolver', 'course', eccCourseResolve);
tsQhull.set('storage', 'sentence', eccSentenceLoad);
tsQhull.set('resolver', 'sentence', eccSentenceResolve);
tsQhull.set('storage', 'subject', eccSubjectLoad);
tsQhull.set('resolver', 'subject', eccSubjectResolve);
tsQhull.set('resolver', 'qsetUi', eccQsetUiResolve);

tsQhull.set('ui', 'title', '코스 실행기');
tsQhull.set('ui', 'titleLogo', 'db/img/titleLogo.png');
tsQhull.set('ui', 'fullLogo', 'db/img/fullLogo.png');
tsQhull.set('ui', 'contentRatio', '0.5625'); // 720/1280