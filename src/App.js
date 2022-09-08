import { useCallback, useEffect, useRef, useState } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Stack from 'react-bootstrap/Stack';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Image from 'react-bootstrap/Image';

import Color from './components/Color';
import { $, IMG_MAP } from './helpers/constants';

function App() {
  const viewMap = useRef(null);
  const [link, setLink] = useState('');
  const [selectedColor, setSelectedColor] = useState('red');
  const [selectedImg, setSelectedImg] = useState('right-arrow');
  const [textSize, setTextSize] = useState('');
  const [textValue, setTextValue] = useState('');
  const [zoom, setZoom] = useState('');

  useEffect(() => {
    $('._image_maps').imageMaps({
      isEditMode: true,
      shape: 'rect',
      shapeStyle: {
        fill: '#ffffff',
        stroke: 'red',
        'stroke-width': 2,
      },
      onSelect(e, data) {
        console.log(data);
      },
    });

    viewMap.current = $('._image_maps_view');
    viewMap.current.imageMaps();
  }, []);

  const checkColor = (color) => {
    return selectedColor === color
      ? '3px solid black'
      : '3px solid transparent';
  };

  const handleColor = useCallback((color) => {
    setSelectedColor(color);
  }, []);

  const handleImg = useCallback((img) => {
    setSelectedImg(img);
  }, []);

  const handleBasicShape = (shape) => () => {
    if (!selectedColor) return;

    $('._image_maps')
      .setShapeStyle({
        fill: selectedColor,
        stroke: selectedColor,
        'stroke-width': 2,
      })
      .addShape(null, link, shape);
  };

  const handleTextShape = () => {
    if (!selectedColor) return;

    $('._image_maps')
      .setTextShape(textValue, {
        fill: selectedColor,
        stroke: '',
        'stroke-width': '',
      })
      .addShape([null, null, textSize], link, 'text');
  };

  const handleImgShape = () => {
    $('._image_maps')
      .setImageShape(IMG_MAP[selectedImg])
      .addShape(null, link, 'image');
  };

  const removeShape = useCallback(() => {
    $('._image_maps').removeShape();
  }, []);

  const removeAllShapes = useCallback(() => {
    $('._image_maps').removeAllShapes();
  }, []);

  const handleZoom = () => {
    const val = Number(zoom || 100);

    if (typeof val !== 'number' || isNaN(val) || val <= 0) {
      alert('You must enter a number and one greater than 0.');
      return;
    }

    viewMap.current.zoom([val]);

    $('._imageMaps_area_view').css({
      width: val * 0.01 * viewMap.current.width(),
      height: val * 0.01 * viewMap.current.height(),
    });
  };

  const viewResult = useCallback(() => {
    $('._image_maps').copyImageMapsTo($('._image_maps_view'));
  }, []);

  return (
    <>
      <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand href="/">Image Maps</Navbar.Brand>
        </Container>
      </Navbar>

      <Container className="mt-5 mb-5" style={{ maxWidth: '720px' }}>
        <Stack gap={4}>
          <Form.Group>
            <Form.Label htmlFor="shapeUrl">1. Shape Url</Form.Label>
            <Form.Control
              type="text"
              id="shapeUrl"
              value={link}
              placeholder="Input your url"
              onChange={(e) => setLink(e.target.value)}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>2. Color</Form.Label>
            <Stack gap={3} direction="horizontal">
              <Color
                color="red"
                border={checkColor('red')}
                onClick={() => handleColor('red')}
              />

              <Color
                color="green"
                border={checkColor('green')}
                onClick={() => handleColor('green')}
              />

              <Color
                color="blue"
                border={checkColor('blue')}
                onClick={() => handleColor('blue')}
              />

              <Color
                color="purple"
                border={checkColor('purple')}
                onClick={() => handleColor('purple')}
              />

              <Color
                color="yellow"
                border={checkColor('yellow')}
                onClick={() => handleColor('yellow')}
              />
            </Stack>
          </Form.Group>

          <Form.Group>
            <Form.Label>3. Basic Shape Type</Form.Label>
            <Stack gap={3} direction="horizontal">
              <Button variant="outline-dark" onClick={handleBasicShape('rect')}>
                Add Rectangle
              </Button>
              <Button
                variant="outline-dark"
                onClick={handleBasicShape('circle')}
              >
                Add Circle
              </Button>
              <Button
                variant="outline-dark"
                onClick={handleBasicShape('ellipse')}
              >
                Add Ellipse
              </Button>
            </Stack>
          </Form.Group>

          <Form.Group>
            <Form.Label>4. Text Shape Type</Form.Label>
            <Form>
              <Row>
                <Col>
                  <Form.Control
                    placeholder="Text Size"
                    type="number"
                    value={textSize}
                    onChange={(e) => setTextSize(e.target.value)}
                  />
                </Col>
                <Col>
                  <Form.Control
                    placeholder="Some Text"
                    type="text"
                    value={textValue}
                    onChange={(e) => setTextValue(e.target.value)}
                  />
                </Col>
                <Col>
                  <Button variant="light" onClick={handleTextShape}>
                    Add Text
                  </Button>
                </Col>
              </Row>
            </Form>
          </Form.Group>

          <Form.Group>
            <Form.Label>5. Image Shape Type</Form.Label>
            <Stack gap={3} direction="horizontal">
              <Form.Check
                inline
                type="radio"
                label={
                  <img
                    alt="Azure pushpin facing right"
                    src={IMG_MAP['pin']}
                    style={{ width: '45px' }}
                  />
                }
                checked={selectedImg === 'pin'}
                onClick={() => handleImg('pin')}
              />

              <Form.Check
                inline
                type="radio"
                label={
                  <img
                    alt="Azure map marker"
                    src={IMG_MAP['marker']}
                    style={{ width: '45px' }}
                  />
                }
                checked={selectedImg === 'marker'}
                onClick={() => handleImg('marker')}
              />

              <Form.Check
                inline
                type="radio"
                label={
                  <img
                    alt="Pink drawing pin facing right"
                    src={IMG_MAP['drawing-pin']}
                    style={{ width: '45px' }}
                  />
                }
                checked={selectedImg === 'drawing-pin'}
                onClick={() => handleImg('drawing-pin')}
              />

              <Form.Check
                inline
                type="radio"
                label={
                  <img
                    alt="Right arrow button"
                    src={IMG_MAP['right-arrow']}
                    style={{ width: '45px' }}
                  />
                }
                checked={selectedImg === 'right-arrow'}
                onClick={() => handleImg('right-arrow')}
              />

              <Button variant="light" onClick={handleImgShape}>
                Add Image
              </Button>
            </Stack>
          </Form.Group>

          <div>
            <hr />
            <Stack gap={3} direction="horizontal">
              <Button variant="outline-warning" onClick={removeShape}>
                Remove Shape
              </Button>
              <Button variant="outline-danger" onClick={removeAllShapes}>
                Remove all Shapes
              </Button>
            </Stack>
            <hr />
          </div>

          <div className="_imageMaps_area">
            <h5>Edit Image Maps</h5>
            <Image
              fluid
              alt="Jeonju Hanok Village map"
              src="http://cfile209.uf.daum.net/image/247F194A5234414929344E"
              className="_image_maps"
            />
          </div>

          <div className="mt-3">
            <Row>
              <Col md="6">
                <Stack gap={3} direction="horizontal">
                  <h5 className="m-0">Result</h5>

                  <Button variant="outline-primary" onClick={viewResult}>
                    View Result
                  </Button>
                </Stack>
              </Col>

              <Col md="6">
                <Stack gap={2} direction="horizontal">
                  <Form.Control
                    type="number"
                    value={zoom}
                    placeholder="Zoom Percentage"
                    onChange={(e) => setZoom(e.target.value)}
                  />

                  <Button variant="light" onClick={handleZoom}>
                    Zoom
                  </Button>
                </Stack>
              </Col>
            </Row>
          </div>

          <div className="mt-3">
            <Image
              fluid
              alt="Jeonju Hanok Village map"
              src="http://cfile209.uf.daum.net/image/247F194A5234414929344E"
              className="_image_maps_view"
            />
          </div>
        </Stack>
      </Container>
    </>
  );
}

export default App;
