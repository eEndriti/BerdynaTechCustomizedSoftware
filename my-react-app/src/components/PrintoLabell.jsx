import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import JsBarcode from "jsbarcode";
import { Container, Row, Col, Button, Image } from "react-bootstrap";

const PrintoLabell = ({ type = 'service', data }) => {
  const labelRef = useRef();

  const generateBarcode = (id) => {
    const canvas = document.createElement("canvas");
    JsBarcode(canvas, id, {
      format: "CODE128",
      displayValue: true, // Show ID below the barcode
      fontSize: 12,
      width: 2,
      height: 40,
    });
    return canvas.toDataURL("image/png");
  };

  const renderLabel = () => {
    const barcodeImage = generateBarcode('SH-456872');
    switch (type) {
      case "service":
        return (
          <Container
            ref={labelRef}
            className="label"
            style={{
              width: "2in",
              height: "1in",
              border: "1px solid black",
              padding: "1px",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Row>
              <Col className="text-center">{'Ardit'}</Col>
              <Col className="text-center">{'03554921588'}</Col>
            </Row>
            <Row className="d-flex flex-row justify-content-center">
                <Col style={{fontSize:'12px'}} >{'A+ Q- D+ G+'}</Col>
                <Col style={{fontSize:'12px'}} >{'18.01.2025'}</Col>
            </Row>
            <Row>
              <Image style={{maxHeight: '100%' , minHeight:'100%' , fontSize:'25px'}} className="w-100" src={barcodeImage} alt="Barcode" fluid />
            </Row>                           
          </Container>
        );
      case "product":
        return (
          <Container
            ref={labelRef}
            className="label"
            style={{
              width: "2in",
              height: "1in",
              border: "1px solid black",
              padding: "5px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Row>
              <Col>
                <Image src={barcodeImage} alt="Barcode" fluid />
              </Col>
            </Row>
            <Row>
              <Col className="text-center">{'data.processor'}</Col>
            </Row>
            <Row>
              <Col className="text-center">{'data.specifications'}</Col>
            </Row>
            <Row>
              <Col className="text-center">{'data.price'}</Col>
            </Row>
          </Container>
        );
      case "minimal":
        return (
          <Container
            ref={labelRef}
            className="label"
            style={{
              width: "2in",
              height: "1in",
              border: "1px solid black",
              padding: "5px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Row>
              <Col>
                <Image src={barcodeImage} alt="Barcode" fluid />
              </Col>
            </Row>
            <Row>
              <Col className="text-center">{'data.price'}</Col>
            </Row>
          </Container>
        );
      default:
        return <p>Invalid label type</p>;
    }
  };

  const printFn = useReactToPrint({
    contentRef: labelRef.current,
    documentTitle: "AwesomeFileName"
  });

  return (
    <div className="mt-5">
      <Container ref={labelRef.current} className="label" /> 
      {renderLabel()}
      <Button variant="primary" className="mt-3" onClick={printFn}>
        Print
      </Button>
    </div>
  );
};

export default PrintoLabell;
