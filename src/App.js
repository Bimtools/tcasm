import logo from "./logo.svg";
import "./App.css";
import * as WorkspaceAPI from "trimble-connect-workspace-api";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  GetDrawingRequest,
  UpdateViewVisibilityRequest,
  GetTrbModelRequest,
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
  const loading = useSelector((state) => state.drawing.pending);

  React.useEffect(() => {
    async function fetchData() {
      const url = window.location.href;
      const ifcGuid = url.split("?")[1];
      if (!ifcGuid) {
        return;
      }
      if (ifcGuid.length !== 22) {
        return;
      }
      const tcapi = await WorkspaceAPI.connect(window.parent);
      var models;
      do {
        models = await tcapi.viewer.getModels();
      } while (models === undefined || models.length === 0);
      var asm;

      var trimBimModels = [];
      var modelId;
      for (const model of models) {
        console.log(model);
        const modelName = model.name;
        if (modelName.indexOf(".trb") >= 0) {
          trimBimModels.push(model);
        } else if (
          modelName.indexOf(".ifc") >= 0 ||
          modelName.indexOf(".tekla") >= 0
        ) {
          const loadedModel = await tcapi.viewer.getLoadedModel(model.id);
          console.log(loadedModel);
          if (loadedModel === undefined) {
            console.log("Load model " + model.id);
            await tcapi.viewer.toggleModel(model.id, true, true);
          }

          var modelObjects;
          do {
            modelObjects = await tcapi.viewer.getObjects();
          } while (modelObjects === undefined || modelObjects.length === 0);
          console.log(modelObjects);
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
          } else {
            await tcapi.viewer.toggleModel(model.id, false, true);
          }
        }
      }
      dispatch(GetTrbModelRequest(trimBimModels));

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
      console.log("Zoom to object done");
      //await tcapi.viewer.toggleModel('j5V7h81tM00', true, false);
    }
    fetchData();

    dispatch(
      GetDrawingRequest({
        id: "rKq83TRZB_Y",
      }),
    );
  }, []);
  return (
    <div className="App">
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
                  dispatch(
                    UpdateViewVisibilityRequest({
                      ...item,
                      show: !item.show,
                    }),
                  );
                  const tcapi = await WorkspaceAPI.connect(window.parent);
                  const trimBimModel = trimBimModels.find(
                    (model) => item.file === model.name,
                  );
                  console.log(trimBimModel);
                  if (trimBimModel === undefined) return;
                  const loadedModel1 = await tcapi.viewer.getLoadedModel(
                    trimBimModel.id,
                  );
                  if (loadedModel1 === undefined) {
                    await tcapi.viewer.toggleModel(trimBimModel.id, true, true);
                  }
                  const modelObjects = await tcapi.viewer.getObjects();
                  console.log(modelObjects);
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
