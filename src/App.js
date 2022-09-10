import { useCallback, useEffect, useRef, useState } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Stack from 'react-bootstrap/Stack';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Image from 'react-bootstrap/Image';
import LoadingBar from 'react-top-loading-bar';

import Color from './components/Color';
import { $, IMG_MAP, ALLOWED_TYPES, API_URL } from './helpers/constants';

function App() {
  const viewMap = useRef(null);
  const mounted = useRef(false);
  const loader = useRef(null);
  const [disabled, setDisabled] = useState(false);
  const [imgSrc, setImgSrc] = useState('');
  const [imgHash, setImgHash] = useState(Date.now());
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
    });

    viewMap.current = $('._image_maps_view');
    viewMap.current.imageMaps();

    if (!mounted.current) loadImg();

    mounted.current = true;
  }, []);

  useEffect(() => {
    if (imgSrc) loadDB();
  }, [imgSrc, imgHash]);

  const checkColor = (color) => {
    return selectedColor === color
      ? '3px solid black'
      : '3px solid transparent';
  };

  const findImgName = (base64) => {
    let name = '';
    Object.keys(IMG_MAP).forEach((key) => {
      if (IMG_MAP[key] === base64) {
        name = key;
        return;
      }
    });
    return name;
  };

  const renderShapes = (shapes) => {
    shapes.forEach((shape) => {
      switch (shape.type) {
        case 'circle':
        case 'rect':
        case 'ellipse':
          $('._image_maps')
            .setShapeStyle({
              fill: shape.fill,
              stroke: shape.stroke,
              'stroke-width': shape['stroke-width'],
            })
            .addShape(JSON.parse(shape.coords), shape.link, shape.type);
          break;
        case 'text':
          $('._image_maps')
            .setTextShape(shape.text, {
              fill: shape.fill,
              stroke: '',
              'stroke-width': '',
            })
            .addShape(JSON.parse(shape.coords), shape.link, 'text');
          break;
        case 'image':
          $('._image_maps')
            .setImageShape(IMG_MAP[shape.imageName])
            .addShape(JSON.parse(shape.coords), shape.link, 'image');
          break;
        default:
          break;
      }
    });
  };

  const handleImgUpload = async (file) => {
    if (ALLOWED_TYPES.includes(file.type)) {
      setDisabled(true);
      loader.current.continuousStart();

      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`${API_URL}/image`, {
        method: 'POST',
        body: formData,
      }).then((res) => res.json());
      setImgSrc(res.imagePath);
      setImgHash(Date.now());

      setDisabled(false);
      loader.current.complete();
    }
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

  const syncDB = async () => {
    setDisabled(true);
    loader.current.continuousStart();
    const shapes = $('._image_maps').getAllShapes();
    const mappedShapes = Object.keys(shapes).map((key) => ({
      type: shapes[key].type,
      coords: JSON.stringify(shapes[key].coords),
      fill: shapes[key].style?.fill,
      stroke: shapes[key].style?.stroke,
      strokeWidth: shapes[key].style?.['stroke-width']
        ? parseInt(shapes[key].style['stroke-width'])
        : null,
      text: shapes[key].text,
      link: shapes[key].url,
      imageName: findImgName(shapes[key].href),
    }));

    const res = await fetch(`${API_URL}/shape`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shapes: mappedShapes }),
    }).then((res) => res.json());
    console.log('ras', res);
    loader.current.complete();
    setDisabled(false);
  };

  const loadDB = async () => {
    setDisabled(true);
    loader.current.continuousStart();
    $('._image_maps').removeAllShapes();
    viewMap.current.removeAllShapes();

    const res = await fetch(`${API_URL}/shape`).then((res) => res.json());
    renderShapes(res.shapes);

    loader.current.complete();
    setDisabled(false);
  };

  const loadImg = async () => {
    const imgRes = await fetch(`${API_URL}/image`).then((res) => res.json());
    setImgSrc(imgRes.imagePath);
  };

  return (
    <>
      <LoadingBar color="#0d6efd" ref={loader} />

      <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand href="/">Image Maps</Navbar.Brand>
        </Container>
      </Navbar>

      <Container className="mt-5" style={{ maxWidth: '720px' }}>
        <Stack gap={4}>
          <Form.Group>
            <Form.Label>Upload Image</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={(e) => handleImgUpload(e.target.files[0])}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label htmlFor="shapeUrl">1. Shape Url</Form.Label>
            <Form.Control
              type="text"
              id="shapeUrl"
              value={link}
              placeholder="Input your url"
              disabled={disabled}
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
              <Button
                disabled={disabled}
                variant="outline-dark"
                onClick={handleBasicShape('rect')}
              >
                Add Rectangle
              </Button>
              <Button
                disabled={disabled}
                variant="outline-dark"
                onClick={handleBasicShape('circle')}
              >
                Add Circle
              </Button>
              <Button
                disabled={disabled}
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
                    disabled={disabled}
                    onChange={(e) => setTextSize(e.target.value)}
                  />
                </Col>
                <Col>
                  <Form.Control
                    placeholder="Some Text"
                    type="text"
                    value={textValue}
                    disabled={disabled}
                    onChange={(e) => setTextValue(e.target.value)}
                  />
                </Col>
                <Col>
                  <Button
                    disabled={disabled}
                    variant="light"
                    onClick={handleTextShape}
                  >
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
                disabled={disabled}
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
                disabled={disabled}
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
                disabled={disabled}
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
                disabled={disabled}
                checked={selectedImg === 'right-arrow'}
                onClick={() => handleImg('right-arrow')}
              />

              <Button
                disabled={disabled}
                variant="light"
                onClick={handleImgShape}
              >
                Add Image
              </Button>
            </Stack>
          </Form.Group>

          <div>
            <hr />
            <Stack gap={3} direction="horizontal">
              <Button
                disabled={disabled}
                variant="outline-warning"
                onClick={removeShape}
              >
                Remove Shape
              </Button>
              <Button
                disabled={disabled}
                variant="outline-danger"
                onClick={removeAllShapes}
              >
                Remove all Shapes
              </Button>
              <Button
                disabled={disabled}
                variant="outline-primary"
                onClick={syncDB}
              >
                Sync with DB
              </Button>
            </Stack>
            <hr />
          </div>

          <div className="_imageMaps_area">
            <h5>Edit Image Maps</h5>
            <Image fluid src={`${imgSrc}?${imgHash}`} className="_image_maps" />
          </div>

          <div className="mt-3">
            <Row>
              <Col md="6">
                <Stack gap={3} direction="horizontal">
                  <h5 className="m-0">Result</h5>

                  <Button
                    disabled={disabled}
                    variant="outline-primary"
                    onClick={viewResult}
                  >
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
                    disabled={disabled}
                    onChange={(e) => setZoom(e.target.value)}
                  />

                  <Button
                    disabled={disabled}
                    variant="light"
                    onClick={handleZoom}
                  >
                    Zoom
                  </Button>
                </Stack>
              </Col>
            </Row>
          </div>
        </Stack>
      </Container>
      <div className="mt-5 mb-5 mx-auto" style={{ maxWidth: '720px' }}>
        <img
          style={{ width: '100%' }}
          src={`${imgSrc}?${imgHash}`}
          className="_image_maps_view"
        />
      </div>
    </>
  );
}

export default App;
