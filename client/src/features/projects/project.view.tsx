import { useParams, Link } from "react-router-dom";
import { Typography, Box, Button } from "@mui/material";
import Layout from "components/layout.component";
import { getProject } from "config/projects.config";

export default function ProjectView() {
  const { id } = useParams<{ id: string }>();
  const project = id ? getProject(id) : undefined;

  if (!project) {
    return (
      <Layout>
        <Typography>Projet introuvable.</Typography>
        <Button component={Link} to="/" sx={{ mt: 2 }}>
          Retour
        </Button>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ maxWidth: 800, mx: "auto", p: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {project.name}
        </Typography>
        {project.description && (
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {project.description}
          </Typography>
        )}
        <Button component={Link} to="/" sx={{ mt: 4 }}>
          Retour au monde
        </Button>
      </Box>
    </Layout>
  );
}
