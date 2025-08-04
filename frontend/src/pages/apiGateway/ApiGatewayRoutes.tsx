import * as React from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import ApiGatewaySettings from './ApiGatewaySettings';

const ApiGatewayRoutes: React.FC = () => (
  <Routes>
    <Route path="/" element={<ApiGatewaySettings />} />
    <Route path="*" element={<Navigate to="." />} />
  </Routes>
);

export default ApiGatewayRoutes;