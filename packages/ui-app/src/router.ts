import { createRouter, createWebHistory } from "vue-router";
import BasicPage from "./pages/BasicPage.vue";
import SkillPage from "./pages/SkillPage.vue";
import ProjectsPage from "./pages/ProjectsPage.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      redirect: "/basic",
    },
    {
      path: "/basic",
      name: "basic",
      component: BasicPage,
    },
    {
      path: "/skills",
      name: "skills",
      component: SkillPage,
    },
    {
      path: "/projects",
      name: "projects",
      component: ProjectsPage,
    },
  ],
});
