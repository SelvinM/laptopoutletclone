import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Modal } from "antd";
import React from "react";

export const resetFormModal = (onOk: () => void) => {
  Modal.confirm({
    title: `¿Seguro que deseas reiniciar el formulario?`,
    icon: <ExclamationCircleOutlined />,
    okText: "Si",
    centered: false,
    cancelText: "No",
    onOk,
  });
};
