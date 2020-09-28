(function () {
  /////

  /////
  $(document).ready(function () {
    // 태블로 라이브러리 초기화
    tableau.extensions.initializeAsync({ configure: configure }).then(
      // 초기화 완료되면 실행 될 함수
      function () {
        // ===================== 여기는 아직 미구현 =====================
        // 이전에 구성을 했었다면 쿠키 혹은 tableau settings에 정보가 있으므로
        // 구성 버튼을 보이게하지 않고 저장된 값 기반으로 실행해야함
        // ===========================================================
    



        // 버튼 표시 및 클릭 이벤트 달기
        $("#configure-button").show();
        $("#configure-button").on("click", () => configure());
      },
      // 태블로 초기화 중 에러가 발생했을 때 로그
      function (err) {
        console.log(err);
      }
    );
  });
  /////
  let unregisterEventHandlerFunction;
  /////
  // 구성 버튼을 눌렀을 때 구성 다이얼로그 호출
  var configure = () => {
    // 다이얼로그 HTML 파일 경로
    const dialogURL =
      "https://summerce-platform.github.io/DataTableExtension/ConfigureDialog.html";

    /* 
      다이얼로그에게 전달해주고 싶은 값(문자열만 가능!)
      전달할 게 없다면 " " 공백 하나를 넣어 보내면 되고,
      var myOpenPayload = " ";
    */
    var openPayload = " ";

    // 다이얼로그 설정
    const dialogSetting = {
      height: 500,
      width: 500,
    };

    // 다이얼로그 열기
    tableau.extensions.ui
      .displayDialogAsync(dialogURL, openPayload, dialogSetting)
      .then((closePayload) => {
        // 다이얼로그가 정상적으로 종료될 때 다이얼로그가
        // 데이터(문자열만 가능!)를 매개변수에 담아줌
        // 해당 매개변수를 이용해 다이얼로그가 종료될 때 동작할 함수 실행
        onDialogFinished(closePayload);
      })
      .catch((error) => {
        // 다이얼로그가 정상적으로 종료되지 않으면 에러 값을 건네줌
        // 해당 에러 값을 이용해 정상적으로 종료되지 않았을 때 동작할 함수 실행
        onDialogError(error);
      });
  };


  // 다이얼로그가 정상적 흐름으로 종료되면 실행 될 함수
  var onDialogFinished = (payloadString) => {
    // 다이얼로그가 문자열로 준 데이터를 JSON 표기로 파싱
    /*
      payload = {
        sheetName : 문자열,
        columns : 배열
      }

      위 payload 안에 있는 columns는 다음과 같은 구조를 가짐
      !) 태블로 라이브러리에서 얻게 되는 columns과 다름
      !) DataTables에 동적으로 컬럼을 생성하기 위해 만든 메타 데이터로 보면 됨
      columns = [
        {
          fieldName : 문자열,
          isImageURL : true/false,
          altText : 문자열(디폴트 null)
        }, 
        {...}, 
        ...
      ]
    */
    var payload = JSON.parse(payloadString);

    // ===================== 여기는 아직 미구현 =====================
    // 설정 값들을 쿠키 혹은 tableau settings에 저장하고
    // (참고) tableau settings는 워크북에 정보가 저장됨
    // ===========================================================
    /// jh. payloadstring을 setting에 저장?
      tableau.extensions.settings.set(payloadString); 
      console.log(payloadString);




    // 다이얼로그에서 반환된 값을 바탕으로 태블로 라이브러리로부터
    // 데이터를 가져와서 데이터 테이블 초기화(데이터 삽입)
    getDataBy(payload).then((sheetData) => {
      // 테이블이 보이게 한 뒤 - 초기에 display: none 설정되어 있음
      $("#data-table").show();
      // 데이터 테이블 설정할 때 바로 넣어주면 되는 형태의 columns를 얻음
      var columns = setColumns(payload.columns);
      // 데이터 테이블 초기화
      renderDataTable(columns, sheetData);
    });
  };

  // 매개변수에 들어있는 sheetName을 기반으로
  // 데이터 테이블 라이브러리에 맞는 형태로 데이터 가져옴
  var getDataBy = async (payload) => {
    // 선택한 워크시트 찾기
    const worksheets = tableau.extensions.dashboardContent.dashboard.worksheets;
    var worksheet = worksheets.find(
      (sheet) => sheet.name === payload.sheetName
    );

    // 선택한 워크시트에서 데이터를 가져오고 반환
    return await worksheet.getSummaryDataAsync().then((summary) => {
      // 가져온 데이터들이 담길 배열
      var data = [];
      // 각 데이터 행(배열 - row에 한 컬럼씩 담겨서 온다.) 별로
      summary.data.forEach((row) => {
        // 데이터 테이블 라이브러리에 맞는 형태로 변환
        var reformedRow = {};
        /*
          다음 과정을 통해 
          {
            컬럼명 : 데이터,
            컬럼명 : 데이터,
            ...
          }
          형태로 변환하게 됨
        */
        row.forEach((eachColumn, idx) => {
          reformedRow[payload.columns[idx].fieldName] =
            eachColumn.formattedValue;
        });
        // 변환 된 형태대로 데이터 배열에 저장
        data.push(reformedRow);
      });
      // 변환 된 형태의 데이터 반환
      return data;
    });
  };


  // HTML Table 요소에 접근해 상단 컬럼명들 수정 및
  // DataTables 초기화 용 컬럼 배열 반환
  /*
    [
      { data: "컬럼명" },
      { 
        data: "컬럼명", 
        render: function(data, type, row) {...}
      },
      ...
    ] 
    형태로 반환
  */
  var setColumns = (columnsMetaData) => {
    // 컬럼 배열
    var columns = [];
    // columnsMetaData : fieldName, isImageURL, altText로 이루어진 배열
    columnsMetaData.forEach((meta) => {
      var col = {};
      // 컬럼명을 담고
      col["data"] = meta.fieldName;
      // 만약에 이미지 경로 컬럼이라면
      if (meta.isImageURL) {
        // 이미지를 표시하도록 하고
        col["render"] = function (data, type, row) {
          if (type === "display") {
            return imageTag({
              src: data,
              tagStyle: "height: " + meta.size + "px;",
            });
          } else return data;
        };
      }
      // 이미지만 altText가 있게 코드는 짜놨지만, 일단 altText가 있으면 상단 컬럼명 변경
      if (!meta.altText || meta.altText === "") {
        $("#data-table-columns").append($("<th>" + meta.fieldName + "</th>"));
      } else {
        $("#data-table-columns").append($("<th>" + meta.altText + "</th>"));
      }

      // 배열에 담음
      columns.push(col);
    });

    return columns;
  };

  // 데이터 테이블 라이브러리 사용해서 테이블 생성
  var renderDataTable = (columns, dataToRender) => {
    $("#data-table").DataTable({
      // 테이블이 알아서 재초기화 될 수 있도록 삭제 가능하게 설정
      // 이 설정이 없으면 같은 곳에 다시 테이블을 만들 수 없음
      destroy: true,

      // 테이블에 렌더링 될 데이터 지정
      data: dataToRender,

      // 테이블과 페이지 버튼, 부가 기능 버튼 등
      // 배치를 어떻게 할 것인지 작성한 것
      dom: '<"top"BfR>t<"bottom"p><"clear">',

      /*
        총 4가지의 버튼을 사용할 수 있으며 각각 해당하는 라이브러리를
        DataTables 라이브러리를 다운받을 때 같이 선택하여 다운로드 해야 함
        PDF는 한글 지원이 제대로 되지 않는다. 없애는 게 좋을 듯 

        Column Visualization(컬럼 표시 / 미표시) 기능
        excel : 엑셀로 다운로드 기능
        copy : 복사 기능
        pdf : pdf 다운로드 기능
      */
      buttons: ["colvis", "excel", "copy", "pdf"],

      /*
        한 행을 선택할 수 있음
        위에서 추가한 excel, copy, pdf 기능을 선택한 행에 한해 적용
        "shift / ctrl + click" 을 통해 여러 개 선택 가능
      */
      select: true,

      /*
        data에 JSON key 값을 넣어줌
        columns에 들어간 순서대로 <th>에 차례차례 들어감
        render 함수를 따로 지정해줌으로써 원하는 형태로 삽입할 수 있음
        
        render(data, type, row)
        - data : 해당 컬럼에 들어갈 원래의 JSON value가 들어있음
        - type : https://datatables.net/manual/data/orthogonal-data 참고
        - row : 행에 존재하는 다른 값들에 접근하기 위해 사용
      */
      columns: columns,
    });
  };

  /* 
    <a> </a> 태그를 이루는 문자열 반환
    매개변수로
    {
      href: "http://sameple.com",   - 필수
      tagClass: "primary",             - 없어도 됨
      tagStyle: "display: none;",       - 없어도 됨
      inside: "샘플 닷컴으로 이동"
    }
    을 담아줘야 함
    ------- 그냥 함수 없이 문자열로 "<a href='" + url + "'></a>"
    ------- 작성해도 되지만 가독성과 추후 재사용성을 고려해 함수로 작성
  */
  var anchorTag = (obj) => {
    const _start = "<a ";
    const _href = "href='" + obj.href + "' ";
    const _class = obj.tagClass !== null ? "class='" + obj.tagClass + "' " : "";
    const _style = obj.tagStyle !== null ? "style='" + obj.tagStyle + "'>" : "";
    const _end = "</a>";

    return _start + _href + _class + _style + obj.inside + _end;
  };

  /* 
    <img/> 태그를 이루는 문자열 반환
    매개변수로
    {
      src: "http://sameple.com/asdf.jpg",   - 필수
      tagClass: "primary",             - 없어도 됨
      tagStyle: "display: none;"       - 없어도 됨
    }
    을 담아줘야 함
  */
  var imageTag = (obj) => {
    const _start = "<img ";
    const _src = "src='" + obj.src + "' ";
    const _class = obj.tagClass !== null ? "class='" + obj.tagClass + "' " : "";
    const _style =
      obj.tagStyle !== null ? "style='" + obj.tagStyle + "'/>" : "/>";

    return _start + _src + _class + _style;
  };

  // 다이얼로그 에러 시 실행 될 함수
  var onDialogError = (error) => {
    if (error.errorCode === tableau.ErrorCodes.DialogClosedByUser) {
      console.log("사용자에 의한 다이얼로그 종료");
    } else {
      console.log(error);
    }
  };










})();
