(function () {
  const worksheetSettingsKey = 'selectedWorksheet';
  const columnsSettingsKey = 'selectedColumn';
  var selectedWorksheet;
  var columns = [];

  $(document).ready(function () {
    tableau.extensions.initializeDialogAsync().then(function (openPayload) {
      // openPayload에 부모가 담아준 값이 들어있지만 사용하지 않음

      // 태블로 워크시트들
      const worksheets =
        tableau.extensions.dashboardContent.dashboard.worksheets;

      // 워크시트들의 이름으로 버튼들 생성
      worksheets.forEach((sheet, idx) => {
        // 발견한 시트마다 버튼 생성
        let btn = makeButton(sheet.name, "sheet-", idx, () =>
          // 버튼마다 클릭 이벤트
          onSelectWorksheet(sheet.name, idx)
        );
        // 만든 버튼을 HTML 공간에 삽입
        $("#select-worksheet-area").append(btn);
      });
    });

    // 완료 버튼에 클릭 이벤트
    $("#finish-btn").on("click", () => finishDialog());
  });

  /*
    버튼 생성 함수
    name : '완료' 버튼과 같이 버튼에 표시될 이름
    prefix : 버튼의 id 앞 부분 (ex : sheet-)
    id : 버튼의 id 뒷 부분 (ex : '1'이라면, prefix와 합쳐 'sheet-1'이 id)
    onClickFunction : 버튼이 눌리면 실행 될 함수
  */
  var makeButton = (name, prefix, id, onClickFunction) => {
    const button = $("<input type='button'>");
    button.attr("id", prefix + id);
    button.val(name);
    button.addClass("btn btn-outline-primary btn-sm");
    button.on("click", () => onClickFunction());
    return button;
  };

  // 워크시트 선택 버튼 클릭 시 실행 될 함수
  var onSelectWorksheet = (sheetName, idx) => {
    // 전역 변수에 선택한 워크시트 저장
    selectedWorksheet = sheetName;
    tableau.extensions.settings.set('sheet',selectedWorksheet);
    // 버튼 선택 효과 (outline-primary -> primary)
    $("input[id^='sheet-']").attr("class", "btn btn-outline-primary btn-sm");
    $("#sheet-" + idx).attr("class", "btn btn-primary btn-sm");

    // 컬럼 가져온 후 세부 설정 영역 표시
    getColumns().then(() => {
      showSettingDetailsArea();
    });
  };

  // 컬럼들 가져오기
  var getColumns = async () => {
    // 다른 워크시트를 선택한 적이 있다면 columns 전역변수가 비어있지 않으므로 초기화
    columns = [];

    // 워크시트 찾기
    const worksheets = tableau.extensions.dashboardContent.dashboard.worksheets;
    var worksheet = worksheets.find(
      (sheet) => sheet.name === selectedWorksheet
    );


    ///if문 만들어서 다
    // 찾은 워크시트에서 컬럼 정보 가져오기
    return await worksheet.getSummaryDataAsync().then((summary) => {
      // 각 컬럼을
      summary.columns.forEach((column) => {
        // 전역변수에 저장
        columns.push({
          fieldName: column.fieldName,
          isImageURL: false,
          altText: null,
        });
      });
////컬럼정보 가져온거 기반해서 컬럼 선택하기
        
        // console.log(summary.columns);
    });
  };

  // 세부 설정 영역 표시
  var showSettingDetailsArea = () => {
    $("#select-image-column-area").show();
    $("#select-column-area").show();

    $("#select-layout-area").show();
    // id가 "select-image-column"인 영역에 버튼들 생성
    selectColumnButtons();
    selectImageColumnButtons();
  };


///
 //  컬럼 옵션 생성
 var selectColumnButtons = () => {
  var targetArea2 = $("#select-column");
  // 이미 옵션이 존재할 경우 삭제
  targetArea2.empty();
  /*
    each column = {
      dataType : "string"
      fieldName : "GOODS_CODE"
      index : 0
      isReferenced : true
    }
  */
 $("#select-column").find('option').remove();
  columns.forEach((column, idx) => {
    ///select box에 컬럼 넣기
      $("#select-column").append('<option value="'+column.fieldName+'">'+column.fieldName+'</option>');
      
  });
  $("#submitCol").click(function(){
    var myColumn1 = $("#select-column").val();
    var myColumn = JSON.stringify(myColumn1);
    console.log(myColumn);
    // console.log($("#select-column").val());
    $("#test1").text(myColumn);


        ///if문 만들어서 다
    // 찾은 워크시트에서 컬럼 정보 가져오기
    
      // 각 컬럼을
      columns.forEach((myColumn) => {
        // 전역변수에 저장
        columns = [];
        columns.push({
          fieldName: myColumn,
          isImageURL: false,
          altText: null,
        });
      });
      $("#test2").text(columns);
///이미지 버튼 생성하기
      var targetArea = $("#select-image-column");
      // 이미 버튼이 존재할 경우 삭제
      targetArea.empty();
      /*
        each column = {
          dataType : "string"
          fieldName : "GOODS_CODE"
          index : 0
          isReferenced : true
        }
      */
      columns.forEach((column, idx) => {
        // 버튼 생성
        let btn = makeButton(column.fieldName, "imgcol-", idx, () =>
          // 버튼 클릭 시 실행 될 함수
          onSelectImageColumn(column.fieldName, idx)
        );
        // 버튼 삽입
        targetArea.append(btn);
      });

      var onSelectImageColumn = (fieldName, idx) => {
        // 버튼 선택 효과 (outline-primary -> primary)
        $("input[id^='imgcol-']").attr("class", "btn btn-outline-primary btn-sm");
        $("#imgcol-" + idx).attr("class", "btn btn-primary btn-sm");
        // 다른 걸 이미 선택했었을 수도 있으니 isImageURL 값을 모두 false로 초기화
        columns.forEach((col) => {
          col.isImageURL = false;
        });
    
        // 선택된 컬럼에 한해서만 isImageURL = true
        var selectedColumn = columns.find((col) => col.fieldName === fieldName);
        selectedColumn.isImageURL = true;
      };
  })

};


  
  // // 이미지 선택 컬럼 버튼들 생성
  // var selectImageColumnButtons = () => {
  //   var targetArea = $("#select-image-column");
  //   // 이미 버튼이 존재할 경우 삭제
  //   targetArea.empty();
  //   /*
  //     each column = {
  //       dataType : "string"
  //       fieldName : "GOODS_CODE"
  //       index : 0
  //       isReferenced : true
  //     }
  //   */
  //   columns.forEach((column, idx) => {
  //     // 버튼 생성
  //     let btn = makeButton(column.fieldName, "imgcol-", idx, () =>
  //       // 버튼 클릭 시 실행 될 함수
  //       onSelectImageColumn(column.fieldName, idx)
  //     );
  //     // 버튼 삽입
  //     targetArea.append(btn);
  //   });
  // };

  // 이미지 컬럼 선택 시 실행 될 함수


  // 완료 버튼 클릭 시 실행 될 함수
  var finishDialog = () => {
    // 워크시트를 선택한 적이 없다면
    if (!selectedWorksheet) {
      alert("워크시트를 선택하세요.");
    }
    // 워크시트를 선택한 적이 있다면
    else {
      // 이미지 컬럼 사이즈 값 받아오기
      var imgSize = $("#image-size").val();
      // 이미지 컬럼 상단 대체 텍스트 값 받아오기
      var imgAltText = $("#alt-text").val();
      // 이미지 컬럼 찾기
      var imgColumn = columns.find((col) => col.isImageURL === true);

      // 이미지 컬럼이 존재하면
      if (imgColumn) {
        // 이미지 사이즈가 적혀있는지 확인해서 없으면 디폴트 60 설정
        if (imgSize !== "") imgColumn.size = parseInt(imgSize);
        else imgColumn.size = 60;
        // 이미지 컬럼명 대체 텍스트가 존재하면 대체 텍스트 설정
        if (imgAltText !== "") imgColumn.altText = imgAltText;
      }

      // closePayload에 지금껏 선택했던 sheetName과 columns 담기
      var closePayload = {
        sheetName: selectedWorksheet,
        columns: columns,
      };
      
      // 다이얼로그를 종료하며 closePayload 정보를 담아 부모 페이지에 전송
      // let currentSettings = tableau.extensions.settings.getAll();
      // tableau.extensions.settings.saveAsync().then((newSavedSettings)=>{
      //   tableau.extensions.ui.closeDialog(JSON.stringify(closePayload));
      // })
      
      tableau.extensions.settings.set(worksheetSettingsKey, selectedWorksheet);
      tableau.extensions.settings.set(columnsSettingsKey, JSON.stringify(columns));
      tableau.extensions.settings.saveAsync().then((newSavedSettings)=> {
        tableau.extensions.ui.closeDialog(JSON.stringify(closePayload));
      })



           



    }
  };


})();
