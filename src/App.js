import logo from "./logo.svg";
import "./App.css";
import * as WorkspaceAPI from "trimble-connect-workspace-api";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  GetDrawingRequest,
  UpdateViewVisibilityRequest,
  GetTrbModelRequest,
  GetAnnIdRequest,
  ShowAnnRequest,
} from "./store/drawing/action";
import {
  ScissorOutlined,
  EyeInvisibleFilled,
  EyeFilled,
} from "@ant-design/icons";
import { Button, List, Typography } from "antd";

const { Text } = Typography;
function App() {
  const dispatch = useDispatch();
  const views = useSelector((state) => state.drawing.payload);
  const trimBimModels = useSelector((state) => state.drawing.trbModels);
  const annIds = useSelector((state) => state.drawing.annIds);
  const showAnn = useSelector((state) => state.drawing.showAnn);
  const loading = useSelector((state) => state.drawing.pending);
  const [asm, setAsm] = useState();
  const [modelId, setModelId] = useState();

  async function fetchData() {
    const tcapi = await WorkspaceAPI.connect(window.parent);
    const token = await tcapi.extension.requestPermission("accesstoken");
    window.localStorage.setItem("trimbleToken", token);
    const url = window.location.href;
    const propertyString = url.split("?")[1];
    const ifcGuid = propertyString?.split("ibim")[0];
    const fId = propertyString?.split("ibim")[1];
    if (!ifcGuid) {
      return;
    }
    if (ifcGuid.length !== 22) {
      return;
    }
    if (!fId) {
      return;
    }
    dispatch(
      GetDrawingRequest({
        id: fId,
      }),
    );

    var models;
    do {
      models = await tcapi.viewer.getModels();
    } while (models === undefined || models.length === 0);
    var asm;

    var modelId;
    for (const model of models) {
      const modelName = model.name;
      if (modelName.indexOf(".trb") >= 0) {
        dispatch(
          GetAnnIdRequest({
            name: model.name,
            modelId: model.id,
          }),
        );
      } else if (
        modelName.indexOf(".ifc") >= 0 ||
        modelName.indexOf(".tekla") >= 0
      ) {
        const loadedModel = await tcapi.viewer.getLoadedModel(model.id);
        console.log(loadedModel);
        if (loadedModel === undefined) {
          await tcapi.viewer.toggleModel(model.id, true, true);
        }
        var modelObjects;
        do {
          modelObjects = await tcapi.viewer.getObjects();
        } while (modelObjects === undefined || modelObjects.length === 0);
        const runtimeIds = await tcapi.viewer.convertToObjectRuntimeIds(
          model.id,
          [ifcGuid],
        );
        if (
          runtimeIds !== undefined &&
          runtimeIds.length > 0 &&
          runtimeIds[0] >= 0
        ) {
          asm = runtimeIds[0];
          modelId = model.id;
          break;
        }
      }
    }
    setAsm(asm);
    setModelId(modelId);
    await tcapi.viewer.setSelection({
      modelObjectIds: [
        {
          modelId: modelId,
          objectRuntimeIds: [asm],
        },
      ],
    });
    await tcapi.viewer.isolateEntities([
      {
        modelId: modelId,
        entityIds: [asm],
      },
    ]);
    // await tcapi.viewer.setCamera({
    //   position: {
    //     x: 1358.0000001497558,
    //     y: 2231.9649982910159,
    //     z: 111.12399997144837,
    //   },
    //   projectionType: "ortho",
    //   yaw: Math.PI,
    //   pitch: 0,
    // });
    await tcapi.viewer.setCamera({
      modelObjectIds: [
        {
          modelId: modelId,
          objectRuntimeIds: [asm],
        },
      ],
    });
  }

  React.useEffect(() => {
    fetchData();
  }, []);
  return (
    <div className="App">
      <List>
        <List.Item
          style={{
            marginLeft: "5px",
            marginRight: "5px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              columnGap: "2px",
            }}
          >
            <Button
              type="primary"
              icon={showAnn ? <EyeInvisibleFilled /> : <EyeFilled />}
              onClick={async () => {
                const tcapi = await WorkspaceAPI.connect(window.parent);
                const annObjs = annIds.find((x) => x.name === views[0]?.file);
                const loadedModel = await tcapi.viewer.getLoadedModel(
                  annObjs.modelId,
                );
                if (loadedModel === undefined) {
                  await tcapi.viewer.toggleModel(
                    annObjs.modelId,
                    !showAnn,
                    false,
                  );
                } else {
                  await tcapi.viewer.toggleModel(annObjs.modelId, false, false);
                }
                dispatch(ShowAnnRequest(showAnn));
              }}
            />
            <Text ellipsis strong style={{ fontSize: "15px" }}>
              {views[0]?.file}
            </Text>
          </div>
        </List.Item>
      </List>
      <List
        dataSource={views}
        loading={loading}
        renderItem={(item) => (
          <List.Item
            key={item.key}
            style={{
              alignContent: "center",
              height: "40px",
              marginLeft: "5px",
              marginRight: "5px",
            }}
          >
            <Text
              strong
              style={{
                marginLeft: "20px",
              }}
            >
              {item.name}
            </Text>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                columnGap: "2px",
              }}
            >
              <Button
                type="primary"
                icon={item.show ? <EyeInvisibleFilled /> : <EyeFilled />}
                onClick={async () => {
                  const tcapi = await WorkspaceAPI.connect(window.parent);
                  dispatch(
                    UpdateViewVisibilityRequest({
                      ...item,
                      show: !item.show,
                    }),
                  );
                  console.log(views)
                  const viewsTobeHidden = views.filter((x) => x.show === false);
                  if(viewsTobeHidden.length === views.length) {
                    await tcapi.viewer.toggleModel(item.modelId, false, false);
                  }
                  const annObjs = annIds.find((x) => x.name === item.file);
                  console.log(annObjs);
                  // const viewAnnIds = item.drawingObjects;
                  // console.log(annObjs);
                  // console.log(item.drawingObjects);
                  // const allAnnIds = annObjs.annIds;
                  // const annExtIdsToShow = [];
                  // const annExtIdsToHide = [];
                  // for (const x of allAnnIds) {
                  //   if (viewAnnIds.indexOf(x.annId) >= 0) {
                  //     annExtIdsToShow.push(x.id);
                  //   } else {
                  //     annExtIdsToHide.push(x.id);
                  //   }
                  // }
                  // var annRuntimeIdsShow =
                  //   await tcapi.viewer.convertToObjectRuntimeIds(
                  //     annObjs.modelId,
                  //     annExtIdsToShow,
                  //   );
                  // var annRuntimeIdsHide =
                  //   await tcapi.viewer.convertToObjectRuntimeIds(
                  //     annObjs.modelId,
                  //     annExtIdsToHide,
                  //   );
                  // if (item.show) {
                  //   annRuntimeIds =
                  //     await tcapi.viewer.convertToObjectRuntimeIds(
                  //       annObjs.modelId,
                  //       annExtIdsToHide,
                  //     );
                  // } else {
                  //   annRuntimeIds =
                  //     await tcapi.viewer.convertToObjectRuntimeIds(
                  //       annObjs.modelId,
                  //       annExtIdsToShow,
                  //     );
                  // }
                  // tcapi.viewer.setObjectState(
                  //   {
                  //     modelObjectIds: [
                  //       {
                  //         modelId: annObjs.modelId,
                  //         objectRuntimeIds: annExtIdsToShow,
                  //       },
                  //     ],
                  //   },
                  //   {
                  //     visible: true,
                  //   },
                  // );
                  // tcapi.viewer.setObjectState(
                  //   {
                  //     modelObjectIds: [
                  //       {
                  //         modelId: annObjs.modelId,
                  //         objectRuntimeIds: annRuntimeIdsHide,
                  //       },
                  //     ],
                  //   },
                  //   {
                  //     visible: false,
                  //   },
                  // );

                  // const trimBimModel = trimBimModels.find(
                  //   (model) => item.file === model.name,
                  // );
                  // console.log(trimBimModel);
                  // if (trimBimModel === undefined) return;
                  // const loadedModel1 = await tcapi.viewer.getLoadedModel(
                  //   trimBimModel.id,
                  // );
                  // if (loadedModel1 === undefined) {
                  //   await tcapi.viewer.toggleModel(trimBimModel.id, true, true);
                  // }
                }}
              />
              <Button
                type="primary"
                icon={<ScissorOutlined />}
                onClick={() => {}}
              />
            </div>
          </List.Item>
        )}
      />
    </div>
  );
}

export default App;
