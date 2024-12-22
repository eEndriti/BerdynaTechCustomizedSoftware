import React, { useRef } from "react";
import JsBarcode from "jsbarcode";
import { useReactToPrint } from "react-to-print";
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
              <Col className="text-center">{'data.phoneNumber'}</Col>
            </Row>
            <Row>
              <Col className="text-center">{'data.characters'}</Col>
            </Row>
          </Container>
        );
      case "product":
        return (
          <Container
            ref={labelRef}
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

  const handlePrint = useReactToPrint({
    content: () => labelRef.current,
    documentTitle: "Label",
  });

  return (
    <div className="mt-5">
      {renderLabel()}
        <Button variant="primary" onClick={handlePrint} className="mt-3">
          Print
        </Button>
    </div>
  );
};

export default PrintoLabell;
