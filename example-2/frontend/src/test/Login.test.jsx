import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { MemoryRouter } from "react-router-dom";

import Login from "../pages/Login";
import { AuthProvider } from "../context/AuthContext";
import * as authService from "../services/authService";

vi.mock("../services/authService");

const renderLogin = () => {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </MemoryRouter>
  );
};

describe("Login page", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("displays the login form", () => {
    renderLogin();

    expect(
      screen.getByText(
        "KoalaTech University"
      )
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Email")
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Password")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Login",
      })
    ).toBeInTheDocument();
  });

  it("submits email and password", async () => {
    authService.login.mockResolvedValue({
      access_token:
        "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbkB0ZXN0LmNvbSIsInJvbGUiOiJhZG1pbiJ9.test",
    });

    renderLogin();

    fireEvent.change(
      screen.getByLabelText("Email"),
      {
        target: {
          value: "admin@test.com",
        },
      }
    );

    fireEvent.change(
      screen.getByLabelText("Password"),
      {
        target: {
          value: "password123",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Login",
      })
    );

    await waitFor(() => {
      expect(
        authService.login
      ).toHaveBeenCalledWith({
        email: "admin@test.com",
        password: "password123",
      });
    });
  });

  it("displays an error when login fails", async () => {
    authService.login.mockRejectedValue({
      response: {
        data: {
          detail: "Invalid credentials",
        },
      },
    });

    renderLogin();

    fireEvent.change(
      screen.getByLabelText("Email"),
      {
        target: {
          value: "wrong@test.com",
        },
      }
    );

    fireEvent.change(
      screen.getByLabelText("Password"),
      {
        target: {
          value: "wrongpassword",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Login",
      })
    );

    expect(
      await screen.findByText(
        "Invalid credentials"
      )
    ).toBeInTheDocument();
  });
});